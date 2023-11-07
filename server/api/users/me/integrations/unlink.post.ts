import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/supabase'
import { failureResponse } from '~/types/requests'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)
    const user = await serverSupabaseUser(event)
    if (!user) {
        return failureResponse('User not found.')
    }

    const userId = user.id

    // get ID and platform from body
    const { platform } = body

    // Check to see if we already have an integration for this platform
    const { data: integrationData, error: integrationError } = await client.from('integrations').select('*').eq('user_id', userId).eq('platform', platform).single()

    if (integrationError) {
        return failureResponse(integrationError.message)
    }

    // If we already have an integration, update it
    if (integrationData == null) {
        return failureResponse('Integration not found.')
    } else {
        // Otherwise, create a new integration
        const { error: createError } = await client.from('integrations').delete()
            .eq('user_id', userId)
            .eq('platform', platform)

        if (createError) {
            return failureResponse(createError.message)
        }

        return {
            success: true
        }
    }
})
