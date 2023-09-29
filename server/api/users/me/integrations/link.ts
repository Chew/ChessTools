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
    const { data, platform } = body

    // Check to see if we already have an integration for this platform
    const { data: integrationData, error: integrationError } = await client.from('integrations').select('*').eq('user_id', userId).eq('platform', platform)

    if (integrationError) {
        return {
            success: false,
            error: integrationError.message
        }
    }

    // If we already have an integration, update it
    if (integrationData !== undefined && integrationData.length > 0) {
        const { data: updateData, error: updateError } = await client.from('integrations').update({
            id: integrationData[0].id,
            user_id: userId,
            platform,
            data
        })

        if (updateError) {
            return {
                success: false,
                error: updateError.message
            }
        }

        return {
            success: true,
            data: updateData
        }
    } else {
        // Otherwise, create a new integration
        const { data: createData, error: createError } = await client.from('integrations').insert([{
            user_id: userId,
            platform,
            data: {
                id: data
            },
            verified: false
        }]).select()

        if (createError) {
            return {
                success: false,
                error: createError.message
            }
        }

        return {
            success: true,
            data: createData
        }
    }
})
