import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)
    const user = await serverSupabaseUser(event)
    if (!user) {
        return {
            success: false,
            error: 'User not found.'
        }
    }

    const userId = user.id

    // get ID and platform from body
    const { platform } = body

    // Check to see if we already have an integration for this platform
    const { data: integrationData, error: integrationError } = await client.from('integrations').select('*').eq('user_id', userId).eq('platform', platform).single()

    if (integrationError) {
        return {
            success: false,
            error: integrationError.message
        }
    }

    // If we already have an integration, update it
    if (integrationData == null) {
        return {
            success: false,
            error: 'Could not find integration.'
        }
    } else {
        // Otherwise, create a new integration
        const { error: createError } = await client.from('integrations').delete()
            .eq('user_id', userId)
            .eq('platform', platform)

        if (createError) {
            return {
                success: false,
                error: createError.message
            }
        }

        return {
            success: true
        }
    }
})
