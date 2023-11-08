export interface Game {
    id: string;
    rated: boolean;
    variant: string;
    speed: string;
    perf: string;
    createdAt: number;
    lastMoveAt: number;
    status: string;
    players: {
        white: {
            user: {
                name: string;
                title?: string;
                id: string;
            };
            rating: number;
            provisional: boolean;
        };
        black: {
            user: {
                name: string;
                title?: string;
                id: string;
            };
            rating: number;
            provisional: boolean;
        };
    };
    opening: {
        eco: string;
        name: string;
        ply: number;
    };
    moves: string;
    pgn: string;
    clock: {
        initial: number;
        increment: number;
        totalTime: number;
    }
}
