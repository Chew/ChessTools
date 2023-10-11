export interface USCFMemberTournamentRating {
    /** Whether this only affected online ratings */
    online: boolean;
    /** Previous rating, null if unrated */
    previousElo: number | null;
    /** New rating */
    newElo: number;
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

export interface USCFMemberRating {
    current: {
        elo: number;
        games?: number;
        floor?: number;
        date: string;
    },
    future?: {
        elo: number;
        games?: number;
        date: string;
    }
}

export interface USCFMemberRanking {
    rank: number;
    total: number;
    tied: boolean;
    percentile: number;
}

export interface USCFMember {
    success: boolean;
    error: string | null;
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
    rankings: {
        overall: USCFMemberRanking | null,
        gender: USCFMemberRanking | null,
        state: USCFMemberRanking | null,
    }
    titles: string[],
    state: string,
    gender: string,
    expiration: string,
    fide: {
        id: string | null,
        country: string | null,
        titles: string[],
    },
    lastChange: string,
}

export interface USCFTournamentSectionPlayer {
    pairNumber: number;
    state: string;
    name: string;
    memberId: number;
    totalPoints: number;
    ratings: {
        regular?: {
            pre: number;
            post: number;
        } | null
        quick?: {
            pre: number;
            post: number;
        } | null
        blitz?: {
            pre: number;
            post: number;
        } | null
        onlineRegular?: {
            pre: number;
            post: number;
        } | null
        onlineQuick?: {
            pre: number;
            post: number;
        } | null
        onlineBlitz?: {
            pre: number;
            post: number;
        } | null
    }
    rounds: {
        roundNumber: number;
        result: string;
        color: string;
        opponentPairNumber: number;
    }[]
}

export interface USCFTournamentSection {
    id: number;
    name: string;
    processed: {
        received: string;
        entered: string;
        rated: string;
        reRated?: string
    };
    stats: {
        rounds: number;
        players: number;
        kFactor: string;
        ratingSystem: string;
        tournamentType: string;
        timeControl: string;
    },
    players: USCFTournamentSectionPlayer[]
}

export interface USCFTournament {
    success: boolean;
    error: string | null;
    summary: {
        event: {
            name: string;
            id: number;
        };
        location: string;
        eventDates: string;
        affiliate: {
            name: string;
            id: number;
        }
        chiefTd: {
            name: string;
            id: number;
        }
        processed: {
            received: string;
            entered: string;
            rated: string;
        }
    }
    sections: USCFTournamentSection[];
}

export enum USCFTournamentRatingType {
    // eslint-disable-next-line no-unused-vars
    R = 'regular',
    // eslint-disable-next-line no-unused-vars
    Q = 'quick',
    // eslint-disable-next-line no-unused-vars
    B = 'blitz',
    // eslint-disable-next-line no-unused-vars
    OR = 'onlineRegular',
    // eslint-disable-next-line no-unused-vars
    OQ = 'onlineQuick',
    // eslint-disable-next-line no-unused-vars
    OB = 'onlineBlitz',
}
