import { parse } from 'node-html-parser'
import { gatherElements, findElement, nameAndIdFormatter } from '~/utils/elements'
import {
    USCFTournamentRatingType,
    USCFTournamentSection,
    USCFTournamentSectionPlayer
} from '~/types/uscf'

export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '0')

    // Fetch the HTML page from the USCF website and parse it
    const data = await fetch('https://www.uschess.org/msa/XtblMain.php?' + id + '.0')
        .then(response => response.text())
        .then((data) => {
            return data
                // remove <nobr> tags
                .replaceAll('<nobr>', '').replaceAll('</nobr>', '')
                // fix one of 103 errors on the page
                .replaceAll('<tr class=topbar></td>', '<tr class=topbar>')
        })
        .then((data) => {
            return parse(data)
        })

    // This is specifically the section tables.
    // This will be 2x the amount of sections, odd numbered tables have everything, even numbered tables are just the data formatted better
    const tables: string[][][] = []
    data.querySelectorAll('table').forEach((table) => {
        const elements: string[][] = gatherElements(table)

        tables.push(elements)
    })

    const elements = gatherElements(data)

    const processedInfo = findElement(elements, 'Processed')
    let processed = null
    if (processedInfo) {
        processed = {
            received: processedInfo.split('  ')[0].replace('Received: ', ''),
            entered: processedInfo.split('  ')[1].replace('Entered: ', ''),
            rated: processedInfo.split('  ')[2].replace('Rated: ', '')
        }
    }

    const sections: USCFTournamentSection[] = []
    // SECTION TIME :) :) :) :) :) :) :) :)
    for (let i = 0; i < tables.length; i += 2) {
        const section = tables[i]
        const sectionInfo = tables[i + 1]

        const sectionID = sectionInfo[0][0]

        const processedData = sectionInfo[2][1]

        const processedInfo = {
            received: processedData.split('Received: ')[1].split(' ')[0],
            entered: processedData.split('Entered: ')[1].split(' ')[0],
            rated: processedData.split('Rated: ')[1].split(' ')[0],
            reRated: undefined as string | undefined
        }

        if (processedData.includes('Re-Rated')) {
            processedInfo.reRated = processedData.split('Re-Rated: ')[1].split(' ')[0]
        }

        const statsData = sectionInfo[3][1]
        const statsInfo = {
            rounds: parseInt(statsData.split(' ')[0]),
            players: parseInt(statsData.split(' Rounds, ')[1].split(' Players')[0]),
            kFactor: statsData.split('  ')[1].split(' ')[2],
            ratingSystem: statsData.split('  ')[2].split(' ')[2],
            tournamentType: statsData.split('  ')[3].trim().split(' ')[2],
            timeControl: statsData.split('  ')[4].split(' ')[2]
        }

        const players: USCFTournamentSectionPlayer[] = []
        const playerInfo = section[5][0].split('\n')
        const base = 13
        let rowsOfData = 0
        while (!playerInfo[base + (rowsOfData)].includes('---------')) {
            rowsOfData++
        }
        for (let i = 0; i < statsInfo.players; i++) {
            const start = base + (i * (rowsOfData + 1))
            const info = []
            for (let j = 0; j < rowsOfData; j++) {
                info.push(playerInfo[start + j].split('|').map(ele => ele.trim()))
            }

            const rounds = []
            for (let j = 0; j < statsInfo.rounds; j++) {
                const round = {
                    roundNumber: j + 1,
                    result: info[0][3 + j].split(' ')[0],
                    color: info[1][3 + j],
                    opponentPairNumber: parseInt(info[0][3 + j].split('  ')[1])
                }

                rounds.push(round)
            }

            const totalRatingChanges = info.length - 1

            const ratings: Record<string, object> = {}
            for (let j = 0; j < totalRatingChanges; j++) {
                let rating = info[j + 1][1]
                if (j === 0) {
                    rating = rating.split('/')[1]
                }

                if (rating == null || !rating.includes(':')) {
                    continue
                }

                const type: keyof typeof USCFTournamentRatingType = rating.split(':')[0].trim() as keyof typeof USCFTournamentRatingType
                const pre = parseInt(rating.split(':')[1].split('->')[0])
                const post = parseInt(rating.split(':')[1].split('->')[1])

                ratings[USCFTournamentRatingType[type]] = {
                    pre,
                    post
                }
            }

            const player: USCFTournamentSectionPlayer = {
                pairNumber: parseInt(parse(info[0][0]).text),
                name: parse(info[0][1]).text,
                totalPoints: parseFloat(info[0][2]),
                state: info[1][0],
                memberId: parseInt(info[1][1].split('/')[0]),
                rounds,
                ratings
            }

            players.push(player)
        }

        const sectionData: USCFTournamentSection = {
            id: parseInt(sectionID.split(' - ')[0].split('Section ')[1]),
            name: sectionID.split(' - ')[1],
            processed: processedInfo,
            stats: statsInfo,
            players
        }

        sections.push(sectionData)
    }

    // Return everything :)
    return {
        success: true,
        error: null,

        summary: {
            event: nameAndIdFormatter(findElement(elements, 'Event') || ''),
            location: findElement(elements, 'Location')?.trim(),
            eventDates: findElement(elements, 'Event Date(s)'),
            affiliate: nameAndIdFormatter(findElement(elements, 'Sponsoring Affiliate') || ''),
            chiefTd: nameAndIdFormatter(findElement(elements, 'Chief TD') || ''),
            processed
        },

        sections
    }
})
