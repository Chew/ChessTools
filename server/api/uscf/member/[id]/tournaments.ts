import { parse } from 'node-html-parser';

export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id'));
    // page is a query param, e.g. ?page=2
    let page = parseInt(getQuery(event).page || "0");
    if (page < 1) page = 1;
    const url = `https://www.uschess.org/msa/MbrDtlTnmtHst.php?${id}.${page}`;
    console.log("Fetching " + url)

    const data = await fetch(url)
        .then(response => response.text())
        .then(data => {
            // Jesse, we need to clean up the html
            return data
                // remove no br
                .replaceAll('<nobr>', '').replaceAll('</nobr>', '')
                // remove b
                .replaceAll('<b>', '').replaceAll('</b>', '')
                // don't ask....
                .replace("<tr class=topbar></td>", "<tr class=topbar>")
                ;
        })
        .then(data => {
            return parse(data);
        });

    // check for a tags
    const aTags = data.querySelectorAll('a');
    let totalPages = 0;
    for (let i = 0; i < aTags.length; i++) {
        const link: string = aTags[i].getAttribute('href');
        if (!link.includes("MbrDtlTnmtHst.php") || link.includes("https://")) continue;

        totalPages++;
    }
    if (totalPages == 0) {
        totalPages = 1;
    }
    console.log("Total pages: ", totalPages);

    if (page > totalPages) {
        return {
            success: false,
            message: "Page does not exist",
            tournaments: [],
            page,
            totalPages
        }
    }

    // believe it or not, this is the table. would it kill them to use IDs?
    const tables = data.querySelectorAll('table');
    const tourneyTable = tables[1];

    const rows: string[][] = [];
    tourneyTable.querySelectorAll('tr').forEach((element) => {
        const rowData = [];
        element.querySelectorAll('td').forEach((element) => {
            rowData.push(element.innerText.trim().replaceAll("&nbsp;", ""));
        });

        rows.push(rowData);
    });

    const startingIndex = rows.findIndex(element => element.join(' ').includes('Event Name')) + 1;
    console.log("Today, we're starting at index " + startingIndex)

    const tournaments = [];
    // row at index 0 is the table headers, we can toss those out the window, we just want the data which is 1-indexed
    for (let i = startingIndex; i < rows.length; i++) {
        // index order is as follows: 0 => date\nEvent ID, 1 => Name\nSection, 2-4 => either "" or ratings
        const row = rows[i];
        const tournament = {
            date: row[0].split('\n')[0],
            eventId: parseInt(row[0].split('\n')[1]),
            name: row[1].split('\n')[0],
            section: {
                id: parseInt(row[1].split('\n')[1].split(': ')[0]),
                name: row[1].split('\n')[1].split(': ')[1]
            },
            ratings: {
                regular: row[2] == "" ? null : {
                    online: row[2].includes('ONL'),
                    previousElo: parseInt(row[2].split('=>')[0]),
                    newElo: parseInt(row[2].split('=>')[1])
                },
                quick: row[3] == "" ? null: {
                    online: row[3].includes('ONL'),
                    previousElo: parseInt(row[3].split('=>')[0]),
                    newElo: parseInt(row[3].split('=>')[1])
                },
                blitz: row[4] == "" ? null : {
                    online: row[4].includes('ONL'),
                    previousElo: parseInt(row[4].split('=>')[0]),
                    newElo: parseInt(row[4].split('=>')[1])
                }
            }
        }

        tournaments.push(tournament);
    }

    return {
        tournaments,
        page,
        totalPages,
        success: true
    }
})
