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
    processed?: {
        received: string;
        entered: string;
        rated: string;
        reRated?: string
    };
    stats?: {
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

export interface USCFPlayerSearchResult {
    id: number;
    ratings: {
        regular: number | null;
        quick: number | null;
        blitz: number | null;
        onlineRegular: number | null;
        onlineQuick: number | null;
        onlineBlitz: number | null;
    },
    state: string;
    expirationDate: string;
    name: string;
}

export const USCFPlayerSearchStates = [
    { name: 'Any', abbr: 'ANY' },
    { name: 'Alabama', abbr: 'AL' },
    { name: 'Alaska', abbr: 'AK' },
    { name: 'Arizona', abbr: 'AZ' },
    { name: 'Arkansas', abbr: 'AR' },
    { name: 'California', abbr: 'CA' },
    { name: 'Colorado', abbr: 'CO' },
    { name: 'Connecticut', abbr: 'CT' },
    { name: 'Delaware', abbr: 'DE' },
    { name: 'District of Columbia', abbr: 'DC' },
    { name: 'Florida', abbr: 'FL' },
    { name: 'Georgia', abbr: 'GA' },
    { name: 'Hawaii', abbr: 'HI' },
    { name: 'Idaho', abbr: 'ID' },
    { name: 'Illinois', abbr: 'IL' },
    { name: 'Indiana', abbr: 'IN' },
    { name: 'Iowa', abbr: 'IA' },
    { name: 'Kansas', abbr: 'KS' },
    { name: 'Kentucky', abbr: 'KY' },
    { name: 'Louisiana', abbr: 'LA' },
    { name: 'Maine', abbr: 'ME' },
    { name: 'Maryland', abbr: 'MD' },
    { name: 'Massachusetts', abbr: 'MA' },
    { name: 'Michigan', abbr: 'MI' },
    { name: 'Military (APO/FPO)', abbr: 'MIL' },
    { name: 'Minnesota', abbr: 'MN' },
    { name: 'Mississippi', abbr: 'MS' },
    { name: 'Missouri', abbr: 'MO' },
    { name: 'Montana', abbr: 'MT' },
    { name: 'Nebraska', abbr: 'NE' },
    { name: 'Nevada', abbr: 'NV' },
    { name: 'New Hampshire', abbr: 'NH' },
    { name: 'New Jersey', abbr: 'NJ' },
    { name: 'New Mexico', abbr: 'NM' },
    { name: 'New York', abbr: 'NY' },
    { name: 'North Carolina', abbr: 'NC' },
    { name: 'North Dakota', abbr: 'ND' },
    { name: 'Ohio', abbr: 'OH' },
    { name: 'Oklahoma', abbr: 'OK' },
    { name: 'Oregon', abbr: 'OR' },
    { name: 'Pennsylvania', abbr: 'PA' },
    { name: 'Rhode Island', abbr: 'RI' },
    { name: 'South Carolina', abbr: 'SC' },
    { name: 'South Dakota', abbr: 'SD' },
    { name: 'Tennessee', abbr: 'TN' },
    { name: 'Texas', abbr: 'TX' },
    { name: 'US Territories', abbr: 'TERR' },
    { name: 'Utah', abbr: 'UT' },
    { name: 'Vermont', abbr: 'VT' },
    { name: 'Virginia', abbr: 'VA' },
    { name: 'Washington', abbr: 'WA' },
    { name: 'West Virginia', abbr: 'WV' },
    { name: 'Wisconsin', abbr: 'WI' },
    { name: 'Wyoming', abbr: 'WY' },
    { name: 'Foreign', abbr: 'FOR' }
]
