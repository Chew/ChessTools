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
    { name: 'Alabama', id: 1000 },
    { name: 'Alaska', id: 1001 },
    { name: 'American Samoa', id: 1052 },
    { name: 'Arizona', id: 1002 },
    { name: 'Arkansas', id: 1003 },
    { name: 'Armed Forces Americas', id: 1060 },
    { name: 'Armed Forces Europe', id: 1059 },
    { name: 'Armed Forces Pacific', id: 1061 },
    { name: 'California', id: 1004 },
    { name: 'Colorado', id: 1005 },
    { name: 'Connecticut', id: 1006 },
    { name: 'Delaware', id: 1007 },
    { name: 'District of Columbia', id: 1050 },
    { name: 'Florida', id: 1008 },
    { name: 'Georgia', id: 1009 },
    { name: 'Guam', id: 1053 },
    { name: 'Hawaii', id: 1010 },
    { name: 'Idaho', id: 1011 },
    { name: 'Illinois', id: 1012 },
    { name: 'Indiana', id: 1013 },
    { name: 'Iowa', id: 1014 },
    { name: 'Kansas', id: 1015 },
    { name: 'Kentucky', id: 1016 },
    { name: 'Louisiana', id: 1017 },
    { name: 'Maine', id: 1018 },
    { name: 'Maryland', id: 1019 },
    { name: 'Massachusetts', id: 1020 },
    { name: 'Michigan', id: 1021 },
    { name: 'Minnesota', id: 1022 },
    { name: 'Mississippi', id: 1023 },
    { name: 'Missouri', id: 1024 },
    { name: 'Montana', id: 1025 },
    { name: 'Nebraska', id: 1026 },
    { name: 'Nevada', id: 1027 },
    { name: 'New Hampshire', id: 1028 },
    { name: 'New Jersey', id: 1029 },
    { name: 'New Mexico', id: 1030 },
    { name: 'New York', id: 1031 },
    { name: 'North Carolina', id: 1032 },
    { name: 'North Dakota', id: 1033 },
    { name: 'Northern Mariana Islands', id: 1055 },
    { name: 'Ohio', id: 1034 },
    { name: 'Oklahoma', id: 1035 },
    { name: 'Oregon', id: 1036 },
    { name: 'Pennsylvania', id: 1037 },
    { name: 'Puerto Rico', id: 1056 },
    { name: 'Rhode Island', id: 1038 },
    { name: 'South Carolina', id: 1039 },
    { name: 'South Dakota', id: 1040 },
    { name: 'Tennessee', id: 1041 },
    { name: 'Texas', id: 1042 },
    { name: 'United States Minor Outlying Islands', id: 1058 },
    { name: 'Utah', id: 1043 },
    { name: 'Vermont', id: 1044 },
    { name: 'Virgin Islands', id: 1057 },
    { name: 'Virginia', id: 1045 },
    { name: 'Washington', id: 1046 },
    { name: 'West Virginia', id: 1047 },
    { name: 'Wisconsin', id: 1048 },
    { name: 'Wyoming', id: 1049 }
]

// Response we get from the USCF API
export interface USCFAPISearchResponse {
    values: {
        data: {
            display_name: string;
            external_identifier: string;
            'Player_Details.Rating': number;
            'Player_Details.Quick_Rating': number;
            'Player_Details.Blitz_Rating': number;
            'Player_Details.Online_Regular_Rating': number;
            'Player_Details.Online_Quick_Rating': number;
            'Player_Details.Online_Blitz_Rating': number;
            'Player_Details.Correspondence_Rating': null;
            'Contact_Address_contact_id_01.state_province_id:label': string;
            DATE_Migration_Latest_Membership_End_Date: Date;
            'Player_Details.Privacy_Suppress_Name:label': string;
        };
        columns: {
            val: number | null | string;
            label?: string;
            links?: {
                text: string;
                url: string;
                target: string;
            }[];
        }[];
        cssClass: string;
    }[];
    labels: any[];
    entity: string;
    action: string;
    debug: null;
    version: number;
    count: number;
    countFetched: number;
}
