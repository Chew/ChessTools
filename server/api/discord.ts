import nacl from 'tweetnacl'
import type {
    APIApplicationCommandInteraction,
    APIBaseInteraction,
    APIInteractionResponseChannelMessageWithSource,
    APIPingInteraction,
    APIInteractionResponseCallbackData
} from 'discord-api-types/v10'
import { InteractionResponseType, InteractionType, MessageFlags } from 'discord-api-types/v10'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '~/types/supabase'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body: APIBaseInteraction<InteractionType.Ping | InteractionType.ApplicationCommand, APIApplicationCommandInteraction | APIPingInteraction> = await readBody(event)
    const signature = event.headers.get('x-signature-ed25519') as string
    const timestamp = event.headers.get('x-signature-timestamp') as string

    const rawBody = await readRawBody(event)

    const client = serverSupabaseServiceRole<Database>(event)

    if (!rawBody) {
        throw createError({
            statusCode: 400,
            statusMessage: 'no body'
        })
    }

    if (!verifySecurity(signature, timestamp, rawBody, useRuntimeConfig().discordPublicKey || 'nope')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'invalid request signature'
        })
    }

    // Ping
    if (body.type === InteractionType.Ping) {
        return {
            type: InteractionResponseType.Pong
        }
    }

    if (body.type !== InteractionType.ApplicationCommand) {
        throw createError({
            statusCode: 400,
            statusMessage: 'invalid interaction type'
        })
    }

    // handle commands here. they're here somewhere!
    switch ((body as unknown as APIApplicationCommandInteraction).data.name) {
    // /profile
    case 'profile': {
        const user = await findDiscordUser('my Cool ID', client)

        if (!user) {
            return discordFailureResponse('You must link your account first!')
        }

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: 'Hello, world!',
                flags: MessageFlags.Ephemeral
            } as APIInteractionResponseCallbackData
        } as APIInteractionResponseChannelMessageWithSource
    }
    }
})

function findDiscordUser(userId: String, supabaseClient: SupabaseClient<Database>) {
    return supabaseClient.from('integrations').select('*')
        .eq('platform', 'discord')
        .eq('data->>id', userId)
        .single()
}

function discordFailureResponse(msg: string): APIInteractionResponseChannelMessageWithSource {
    return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: 'Failed! ' + msg,
            flags: MessageFlags.Ephemeral
        } as APIInteractionResponseCallbackData
    } as APIInteractionResponseChannelMessageWithSource
}

/**
 * Required per Discord's guidelines.
 */
function verifySecurity(signature: string, timestamp: string, body: string, publicKey: string) {
    const msg = timestamp.trim() + body.trim()

    return nacl.sign.detached.verify(
        Buffer.from(msg),
        Buffer.from(signature.trim(), 'hex'),
        Buffer.from(publicKey.trim(), 'hex')
    )
}
