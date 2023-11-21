import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/supabase'
import { failureResponse } from '~/types/requests'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)

    const user = await serverSupabaseUser(event)
    if (!user) {
        return failureResponse('User not found.')
    }

    const { data: userData } = await client.from('users').select('*').eq('id', user.id).single()

    if (userData == null) {
        return failureResponse('Failed to load user.')
    }

    return {
        success: true,
        data: userData
    }
})
