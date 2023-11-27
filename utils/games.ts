import { Chess } from 'chess.js'
import type { TableGames } from '~/types/supabase'

export type CleanedGame = {
    id: string,
    whitePlayer: {id: string | null, name: string, elo?: string|number, title?: string},
    blackPlayer: {id: string | null, name: string, elo?: string|number, title?: string},
    cleanResult: (number|string)[],
    friendlyResult: string,
    date?: string,
}

export function cleanGame(game: TableGames, userId?: string, users?: { id: string, username: string | null }[]): CleanedGame {
    const chess = new Chess()
    chess.loadPgn(game.pgn)
    const pgn = chess.header()

    const white: { id: string | null, name: string } = { id: game.white_player, name: findUser(game.white_player, users) || pgn.White }
    const black: { id: string | null, name: string } = { id: game.black_player, name: findUser(game.black_player, users) || pgn.Black }

    const result = pgn.Result.includes('-') ? pgn.Result.split('-') : [-1, -1]
    if (result[0] === '1/2') {
        result[0] = '½'
    }
    if (result[1] === '1/2') {
        result[1] = '½'
    }

    const userIsWhite = userId === game.white_player && userId !== null
    const userIsBlack = userId === game.black_player && userId !== null
    let friendlyResult = 'Unknown'
    let colorIndex = -1

    if (userIsWhite) {
        colorIndex = 0
    } else if (userIsBlack) {
        colorIndex = 1
    }

    if (colorIndex > -1) {
        if (result[colorIndex] === '1') {
            friendlyResult = 'Win'
        } else if (result[colorIndex] === '0') {
            friendlyResult = 'Loss'
        } else if (result[colorIndex] === '½') {
            friendlyResult = 'Draw'
        }
    } else if (result[0] === '1') {
        friendlyResult = 'White Won'
    } else if (result[1] === '1') {
        friendlyResult = 'Black Won'
    } else if (result[0] === '½' && result[1] === '½') {
        friendlyResult = 'Draw'
    }

    let date
    if (pgn.Date) {
        date = pgn.Date
    } else {
        date = game.created_at
    }

    return {
        id: game.id,
        whitePlayer: { ...white, elo: pgn.WhiteElo, title: pgn.WhiteTitle },
        blackPlayer: { ...black, elo: pgn.BlackElo, title: pgn.BlackTitle },
        cleanResult: result,
        friendlyResult,
        date
    }
}

function findUser(id: string | null, users?: { id: string, username: string | null }[]) {
    if (id == null || users === undefined) {
        return null
    }

    return users.find(user => user.id === id)?.username || null
}
