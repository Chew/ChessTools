import { serverSupabaseServiceRole } from '#supabase/server'
import { Database } from '~/types/supabase'
import { failureResponse } from '~/types/requests'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole<Database>(event)
    const username = getRouterParam(event, 'id')
    if (!username) {
        return failureResponse('Username not provided.')
    }

    const { data: userData } = await client.from('users').select('*').eq('username', username).single()

    if (userData == null) {
        return failureResponse('Failed to load user.')
    }

    return {
        success: true,
        data: userData
    }
})
