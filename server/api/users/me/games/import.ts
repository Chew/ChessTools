import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { Game } from '~/types/lichess'
import { Database, TableIntegrations } from '~/types/supabase'
import { failureResponse } from '~/types/requests'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)
    if (!user) {
        return failureResponse('User not found.')
    }

    const serviceClient = serverSupabaseServiceRole<Database>(event)

    const { platformId, platform, platformUsername } = body

    // check if game import exists
    const { data: game } = await client.from('games').select('*').eq('platform_id', platformId).eq('platform', platform).eq('user_id', user.id).single()

    // if it does, return it
    if (game) {
        return {
            success: true,
            id: game.id
        }
    }

    // Otherwise, create a new integration
    // const pgn =
    try {
        const { white, black, pgn } = await gatherData(serviceClient, platform, platformId, platformUsername)

        const { data: game, error: createError } = await client.from('games').insert([{
            user_id: user.id,
            platform_id: platformId,
            platform,
            pgn,
            white_player: white,
            black_player: black
        }]).select()

        if (createError) {
            return failureResponse(createError.message)
        }

        return {
            success: true,
            id: game[0].id
        }
    } catch (error) {
        return failureResponse((error as Error).message)
    }
})

async function findPlayersByIntegration(serviceClient: SupabaseClient<Database>, integration: string, ids: string[]) {
    const { data, error } = await serviceClient.from('integrations').select('*').eq('platform', integration).in('data ->> id', ids)
    if (error) {
        throw error
    }

    return data
}

async function gatherData(serviceClient: SupabaseClient<Database>, platform: string, platformId: string, platformUsername: string): Promise<{ white: string | null; black: string | null; pgn: string }> {
    if (platform === 'lichess') {
        const game = await retrieveLichessGame(platformId)
        const { pgn } = game
        const { white, black } = game.players

        const ids = [white.user.id, black.user.id]
        const players: TableIntegrations[] = (await findPlayersByIntegration(serviceClient, 'lichess', ids))

        return {
            white: players.find(player => player.data.id === white.user.id)?.user_id || null,
            black: players.find(player => player.data.id === black.user.id)?.user_id || null,
            pgn
        }
    }

    throw new Error('Invalid platform.')
}

async function retrieveLichessGame(gameId: string): Promise<Game> {
    return await $fetch<Game>(`https://lichess.org/game/export/${gameId}?pgnInJson=true&opening=true`, {
        headers: {
            Accept: 'application/json'
        }
    })
}
