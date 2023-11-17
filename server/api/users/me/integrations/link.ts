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
    const { data, platform } = body

    // Check to see if we already have an integration for this platform
    const { data: integrationData, error: integrationError } = await client.from('integrations').select('*').eq('user_id', userId).eq('platform', platform)

    if (integrationError) {
        return failureResponse(integrationError.message)
    }

    let newData = data
    let verified = false
    if (platform === 'lichess') {
        try {
            newData = await verifyLichess(data.code, useRuntimeConfig().lichessCodeVerifier, data.redirectUri)
            verified = true
        } catch (e: any) {
            const msg: string = e.message

            if (msg.includes('"https://lichess.org/api/token": 400 Bad Request')) {
                return failureResponse('Lichess code expired. Try linking again.')
            }

            return failureResponse(msg)
        }
    } else if (platform === 'discord') {
        try {
            const config = useRuntimeConfig()
            newData = await verifyDiscord(data.code, config.public.discordClientId, config.discordClientSecret, data.redirectUri)
            verified = true
        } catch (e: any) {
            const msg: string = e.message

            if (msg.includes('400 Bad Request')) {
                return failureResponse('Discord code expired. Try linking again.')
            }

            return failureResponse(msg)
        }
    } else if (platform === 'uscf') {
        newData = {
            id: data
        }
    }

    // If we already have an integration, update it
    if (integrationData !== undefined && integrationData.length > 0) {
        const { data: updateData, error: updateError } = await client.from('integrations').update({
            user_id: userId,
            platform,
            data
        }).eq('id', integrationData[0].id).single()

        if (updateError) {
            return failureResponse(updateError.message)
        }

        return {
            success: true,
            integration: updateData
        }
    } else {
        // Otherwise, create a new integration
        const { data: createData, error: createError } = await client.from('integrations').insert([{
            user_id: userId,
            platform,
            data: newData,
            verified
        }]).select()

        if (createError) {
            return failureResponse(createError.message)
        }

        return {
            success: true,
            integration: createData[0]
        }
    }
})

async function verifyDiscord(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const body = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'identify'
    }

    // convert body to form data
    const formData = new FormData()
    Object.entries(body).forEach(([key, value]) => {
        formData.append(key, value)
    })

    const { access_token: accessToken } = await $fetch<{access_token: string}>('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        body: formData
    })

    const { id, username } = await $fetch<{id: string, username: string}>('https://discord.com/api/v10/users/@me', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })

    return {
        id, username
    }
}

async function verifyLichess(code: string, codeVerifier: string, redirectUri: string) {
    const { access_token: accessToken } = await $fetch<{token_type: string, access_token: string}>('https://lichess.org/api/token', {
        method: 'POST',
        body: {
            grant_type: 'authorization_code',
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
            client_id: 'chess.tools'
        }
    })

    const { id, username } = await $fetch<{id: string, username: string}>('https://lichess.org/api/account', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })

    return {
        id, username
    }
}
