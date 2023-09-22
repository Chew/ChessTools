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
