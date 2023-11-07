import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { failureResponse } from '~/types/requests'
import { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)
    const user = await serverSupabaseUser(event)
    if (!user) {
        return failureResponse('User not found.')
    }

    const userId = user.id

    // get pgn from body
    const { pgn } = body

    // Otherwise, create a new integration
    const { error: createError } = await client.from('games').insert([{
        user_id: userId,
        pgn
    }]).select()

    if (createError) {
        return failureResponse(createError.message)
    }

    return {
        success: true
    }
})
