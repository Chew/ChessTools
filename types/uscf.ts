export interface USCFMember {
    member: {
        id: number;
        name: string;
    },
    ratings: {
        regular: USCFMemberRating,
        quick: USCFMemberRating,
        blitz: USCFMemberRating,
        online_regular: USCFMemberRating,
        online_quick: USCFMemberRating,
        online_blitz: USCFMemberRating,
    },
    state: string,
    gender: string,
    expiration: string,
    fide: {
        id: string | null,
        country: string | null,
    },
    lastChange: string,
}

export interface USCFMemberRating {
    current: {
        elo: number;
        games: number;
        date: string;
    },
    future: {
        elo: number;
        games: number;
        date: string;
    }
}

export interface USCFMemberTournament {
    /** Date of the tournament */
    date: string;
    /** ID of the tournament */
    eventId: number;
    /** Name of the tournament */
    name: string;
    /** What section this member was in */
    section: {
        /** ID of the section */
        id: number;
        /** Name of the section */
        name: string;
    },
    /** Rating changes for this tournament */
    ratings: {
        regular: USCFMemberTournamentRating | null;
        quick: USCFMemberTournamentRating | null;
        blitz: USCFMemberTournamentRating | null;
    },
}

export interface USCFMemberTournamentRating {
    /** Whether this only affected online ratings */
    online: boolean;
    /** Previous rating, null if unrated */
    previousElo: number | null;
    /** New rating */
    newElo: number;
}
