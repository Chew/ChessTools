import { serverSupabaseClient } from '#supabase/server'
import { failureResponse } from '~/types/requests'
import { Database, TableGames } from '~/types/supabase'
import { cleanGame } from '~/utils/games'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') || '0'
    const client = await serverSupabaseClient<Database>(event)

    const { data: games, error } = await client.from('games').select().eq('user_id', id)

    if (error) {
        return failureResponse(error.message)
    }

    // ids we need to fetch meow meow
    const ids: string[] = []

    // get all the ids
    for (const game of games as TableGames[]) {
        const { white_player: white, black_player: black } = game
        if (white !== null && !ids.includes(white)) {
            ids.push(white)
        }
        if (black !== null && !ids.includes(black)) {
            ids.push(black)
        }
    }

    // fetch usernames of the users
    const { data: users, error: usersError } = await client.from('users').select('id,username').order('created_at').in('id', ids)

    if (usersError) {
        return failureResponse(usersError.message)
    }

    // clean the games
    const cleanedGames = games.map((game: TableGames) => {
        return cleanGame(game, id, users)
    }).sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return {
        success: true,
        games: cleanedGames
    }
})
