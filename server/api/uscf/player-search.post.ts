import type { USCFAPISearchResponse } from '~/types/uscf'
import { USCFPlayerSearchResponse } from '~/types/requests'
import { zeroToNull } from '~/utils/responses'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { firstName, lastName, state } = body

    // get current epoch millis
    const now = Date.now()

    // Make the search body
    const searchBody = [[
        'SearchDisplay', 'run', {
            return: 'page:1',
            savedSearch: 'Member_Player_Search',
            display: 'Table',
            sort: [['sort_name', 'ASC']],
            limit: 50,
            seed: now,
            filters: { first_name: firstName, last_name: lastName, 'Contact_Address_contact_id_01.state_province_id': state.join(',') },
            afform: 'afsearchPlayerSearch1'
        }
    ]]

    // Fetch the HTML page from the USCF website and parse it
    const data: USCFAPISearchResponse[] = await $fetch('https://new.uschess.org/civicrm/ajax/api4', {
        method: 'POST',
        // we need a x-www-form-urlencoded body, calls: and then our json
        body: 'calls=' + encodeURIComponent(JSON.stringify(searchBody)),
        // add ajax headers
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-Token': '1'
        }
    })

    const totalPlayers = data[0].count
    const playerRows = data[0].values

    const results = playerRows.map(parsePlayerRow)

    // Return everything :)
    return {
        success: true,
        error: null,

        totalPlayers,
        results
    } as unknown as USCFPlayerSearchResponse
})

function parsePlayerRow(row: USCFAPISearchResponse['values'][0]) {
    const data = row.data

    return {
        id: data.external_identifier,
        ratings: {
            regular: zeroToNull(data['Player_Details.Rating']),
            quick: zeroToNull(data['Player_Details.Quick_Rating']),
            blitz: zeroToNull(data['Player_Details.Blitz_Rating']),
            onlineRegular: zeroToNull(data['Player_Details.Online_Regular_Rating']),
            onlineQuick: zeroToNull(data['Player_Details.Online_Quick_Rating']),
            onlineBlitz: zeroToNull(data['Player_Details.Online_Blitz_Rating'])
        },
        state: data['Contact_Address_contact_id_01.state_province_id:label'],
        expirationDate: data.DATE_Migration_Latest_Membership_End_Date,
        name: data.display_name
    }
}
