import { parse } from 'node-html-parser';

export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id'));

    const data = await fetch("https://www.uschess.org/msa/MbrDtlMain.php?" + id)
        .then(response => response.text())
        .then(data => {
            // remove <nobr> tags
            return data.replaceAll('<nobr>', '').replaceAll('</nobr>', '');
        })
        .then(data => {
            return parse(data);
        });

    const elements: string[][] = [];
    data.querySelectorAll('tr').forEach((element) => {
        // we only want children, so just the tds.
        const children = element.querySelectorAll('td');
        const childrenArray = [];
        for (let i = 0; i < children.length; i++) {
            // sometimes the children text is nested in a <nobr> tag, already inside a <b> tag, we still want the text of that tag
            childrenArray.push(children[i].innerText.trim().replaceAll("&nbsp;", ""));
        }

        elements.push(childrenArray);
    });

    // important indexes
    const startOfRatings = elements.find(element => element.join(' ').includes('Current Published'));
    const lastRatedEvent = elements.find(element => element[0].includes('Last Rated Event'));

    // ratings that will be published on the first of the following month
    // this just means the user has been to a rated tournament this month
    const hasFutureRatings = startOfRatings.join(' ').includes("Published Rating");
    const futureDate = hasFutureRatings ? startOfRatings[2].split(' ')[3] : null;

    const ratings = {
        "regular": {},
        "quick": {},
        "blitz": {},
        "online_regular": {},
        "online_quick": {},
        "online_blitz": {}
    };
    for (let i = elements.indexOf(startOfRatings) + 1; i < elements.indexOf(lastRatedEvent); i++) {
        const ele = elements[i];
        const ratingType = ele[0].split(' ')[0].toLowerCase().replace("-", "_");
        const currentRating = ele[1]; // also has a date and "based on x" games
        const futureRating = hasFutureRatings ? ele[2] : null;

        ratings[ratingType] = {
            current: {
                elo: parseInt(currentRating.split(' ')[0]),
                games: parseInt(currentRating.split(' ')[3]),
                date: currentRating.split('\n')[1]
            },
            future: futureRating ? {
                elo: parseInt(futureRating.split(' ')[0]),
                games: parseInt(futureRating.split(' ')[3]),
                date: futureDate
            } : {}
        }
    }

    // split(/(Last Rated Event: )(\d+)(.*)(Rated on )(\d+-\d+-\d+)/).delete_if { |e| e.blank? }
    const lastRatedInfo = lastRatedEvent[0].split(/(Last Rated Event: )(\d+)(.*)(Rated on )(\d+-\d+-\d+)/);
    const lastRatedEventInfo = {
        id: parseInt(lastRatedInfo[2]),
        name: lastRatedInfo[3].trim(),
        ratedOn: lastRatedInfo[5]
    };

    return {
        // real data here pls! :3
        member: {
            id: parseInt(elements[2][0].split(":")[0]),
            name: elements[2][0].split(': ')[1]
        },
        ratings: ratings,
        lastRatedEvent: lastRatedEventInfo || null,
        state: elements.find(element => element[0] == 'State')[1] || null,
        gender: elements.find(element => element[0] == 'Gender')[1] || null,
        expiration: elements.find(element => element[0] == 'Expiration Dt.')[1] || null,
        fide: {
            id: elements.find(element => element[0] == 'FIDE ID')[1]?.replace("Latest FIDE Rating", "") || null,
            country: elements.find(element => element[0] == 'FIDE Country')[1] || null,
        },
        lastChange: elements.find(element => element[0] == 'Last Change Dt.')[1] || null,
    }
})
