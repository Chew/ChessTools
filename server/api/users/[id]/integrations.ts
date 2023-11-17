import { serverSupabaseServiceRole } from '#supabase/server'
import { Database, TableIntegrations } from '~/types/supabase'
import { failureResponse } from '~/types/requests'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole<Database>(event)
    const userId = getRouterParam(event, 'id')
    if (!userId) {
        return failureResponse('userId not provided')
    }

    const { data: userData } = await client.from('integrations').select('*').eq('user_id', userId) as { data: TableIntegrations[] | null }

    if (userData == null) {
        return failureResponse('Failed to load integrations.')
    }

    const parsed: Record<string, TableIntegrations | null> = {
        chesscom: null,
        lichess: null,
        uscf: null,
        fide: null,
        discord: null
    }

    userData.forEach((integration) => {
        parsed[integration.platform] = integration
    })

    return {
        success: true,
        integrations: parsed
    }
})
