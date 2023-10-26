import { parse } from 'node-html-parser'
import { gatherElements } from '~/utils/elements'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { name, state } = body

    // url encode the name and state
    const nameEncoded = encodeURIComponent(name)
    const stateEncoded = encodeURIComponent(state)

    // Fetch the HTML page from the USCF website and parse it
    const data = await fetch(`https://www.uschess.org/datapage/player-search.php?name=${nameEncoded}&state=${stateEncoded}&order=N&rating=R&mode=Find`)
        .then(response => response.text())
        .then((data) => {
            // remove <nobr> tags
            return data.replaceAll('<nobr>', '').replaceAll('</nobr>', '')
        })
        .then((data) => {
            return parse(data)
        })

    // Gather all the <tr> elements and put their children into a matrix
    const elements: string[][] = gatherElements(data)

    const totalPlayers = parseInt(elements[2][0].split(': ')[1])

    const playerRows = elements.slice(4, totalPlayers + 4)

    const results = playerRows.map(parsePlayerRow)

    // Return everything :)
    return {
        success: true,
        error: null,

        totalPlayers,
        results
    }
})

function parsePlayerRow(row: string[]) {
    const trimmedRows = row.map(r => r.trim())

    return {
        id: parseInt(row[0]),
        ratings: {
            regular: row[1].includes('Unrated') ? null : parseInt(row[1]),
            quick: row[2].includes('Unrated') ? null : parseInt(row[2]),
            blitz: row[3].includes('Unrated') ? null : parseInt(row[3]),
            onlineRegular: row[4].includes('Unrated') ? null : parseInt(row[4]),
            onlineQuick: row[5].includes('Unrated') ? null : parseInt(row[5]),
            onlineBlitz: row[6].includes('Unrated') ? null : parseInt(row[6])
        },
        state: trimmedRows[7],
        expirationDate: trimmedRows[8],
        name: trimmedRows[9]
    }
}
