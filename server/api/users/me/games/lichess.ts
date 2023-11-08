import type { SupabaseClient, User } from '@supabase/supabase-js'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Game } from '~/types/lichess'
import { Database, TableGames } from '~/types/supabase'
import { IntegrationJson } from '~/types/integrations'
import { CleanedGame, cleanGame } from '~/utils/games'
import { failureResponse } from '~/types/requests'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)
    if (!user) {
        return failureResponse('User not found.')
    }

    const results = await Promise.allSettled([
        fetchLichessId(client, user),
        fetchLichessGames(client, user)
    ])

    const data = handleIds(results)
    if (data.error) {
        return failureResponse(data.error)
    }
    if (!data.games) {
        return failureResponse('Games not found.')
    }

    const { lichessId, games } = data

    if (!lichessId) {
        return failureResponse('Lichess ID not found.')
    }

    const lichessData = await fetchLichessData(lichessId)

    // we only need to send certain data back to the frontend. Specifically, the pgn, players, ID, and if it was imported (if so, the chess.tools ID)

    const lichessDataToSend = lichessData.map((game) => {
        const tableGame: TableGames = {
            black_player: null,
            created_at: new Date(game.createdAt).toLocaleString(),
            id: game.id,
            pgn: game.pgn,
            platform: 'lichess',
            platform_id: game.id,
            tournament_info: null,
            user_id: user.id,
            white_player: null
        }

        const cleaned: CleanedGame & {imported?: {status: boolean, id?: string}} = cleanGame(tableGame, user.id, [])

        const imported = games.find(g => g.platform_id === game.id)
        if (imported) {
            cleaned.imported = {
                status: true,
                id: imported.id
            }
        } else {
            cleaned.imported = {
                status: false
            }
        }

        let friendlierResult = cleaned.friendlyResult
        const userWasWhite = lichessId === game.players.white.user.id
        if (userWasWhite && friendlierResult === 'White Won') {
            friendlierResult = 'Win'
        } else if (userWasWhite && friendlierResult === 'Black Won') {
            friendlierResult = 'Loss'
        } else if (!userWasWhite && friendlierResult === 'White Won') {
            friendlierResult = 'Loss'
        } else if (!userWasWhite && friendlierResult === 'Black Won') {
            friendlierResult = 'Win'
        }

        cleaned.friendlyResult = friendlierResult

        return cleaned
    })

    return {
        success: true,
        data: lichessDataToSend
    }
})

function handleIds(results: PromiseSettledResult<any>[]): {success: boolean, error?: string, lichessId?: string, games?: {id: string, platform_id: string|null}[]} {
    const res: {success: boolean, error?: string, lichessId?: string, games?: {id: string, platform_id: string|null}[]} = {
        success: true
    }

    const lichessId = results[0]
    if (lichessId.status === 'rejected') {
        return failureResponse(lichessId.reason.message)
    }
    res.lichessId = (lichessId.value as IntegrationJson).id

    const lichessGames = results[1]
    if (lichessGames.status === 'rejected') {
        return failureResponse(lichessGames.reason.message)
    }

    res.games = lichessGames.value as { id: string, platform_id: string | null }[]

    return res
}

async function fetchLichessId(client: SupabaseClient<Database>, user: User): Promise<IntegrationJson> {
    const lichessId = await client.from('integrations')
        .select('data')
        .eq('user_id', user.id)
        .eq('platform', 'lichess')
        .single()

    if (!lichessId) {
        throw new Error('Lichess account not found.')
    }

    if (lichessId.error) {
        throw new Error(lichessId.error.message)
    }

    return lichessId.data.data
}

async function fetchLichessGames(client: SupabaseClient<Database>, user: User): Promise<{id: string, platform_id: string|null}[]> {
    const { data: games, error } = await client.from('games')
        .select('id, platform_id')
        .eq('user_id', user.id)
        .eq('platform', 'lichess')
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return games
}

async function fetchLichessData(username: string): Promise<Game[]> {
    return await $fetch('https://lichess.org/api/games/user/:username?perfType=bullet,blitz,rapid,classical,correspondence,chess960&pgnInJson=true&opening=true'.replace(':username', username), {
        headers: {
            Accept: 'application/x-ndjson'
        }
    }).then(async (res) => {
        const blob = res as Blob
        const text = await blob.text()
        const cleanData = ('[' + text.split('\n').join(',') + ']').replace(',]', ']')

        return JSON.parse(cleanData)
    })
}
