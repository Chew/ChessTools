import { SupabaseClient } from '@supabase/supabase-js'
import isEmail from 'validator/lib/isEmail'
import validator from 'validator'
import { Database } from '~/types/supabase'
import { serverSupabaseServiceRole } from '#supabase/server'
import isLength = validator.isLength;
import isAlphanumeric = validator.isAlphanumeric;

export default defineEventHandler(async (event) => {
    const client: SupabaseClient = serverSupabaseServiceRole<Database>(event)
    const body = await readBody(event)

    // Validate input
    if (!isEmail(body.email)) { return failure('Invalid email') }
    if (!isAlphanumeric(body.username)) { return failure('Username must be alphanumeric') }
    if (!isLength(body.username, { min: 4, max: 32 })) { return failure('Username must be between 4 and 32 characters') }

    if (!body.token) {
        return failure('Turnstile failed, no token provided. Please try again.')
    }

    const turnstile = await verifyTurnstileToken(body.token, event)

    if (!turnstile.success) {
        return failure('Turnstile failed authentication. Please try again. Error codes: ' + turnstile['error-codes'].join(', '))
    }

    // Check for username availability
    const { data: uCheckData, error: uCheckError } = await client.from('users').select('id').eq('username', body.username)
    if (uCheckError) {
        return failure(uCheckError.message)
    }

    if (uCheckData?.length > 0) {
        return failure('Username is already taken.')
    }

    const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: body.email,
        password: body.password
    })

    if (signUpError) {
        return failure(signUpError.message)
    }

    const signUpUser = signUpData.user
    if (!signUpUser) {
        return failure('Failed to create user.')
    }

    // Create user row in database
    const { error: createUserError } = await client.from('users').insert({
        id: signUpUser.id,
        username: body.username
    })

    if (createUserError) {
        return failure(createUserError.message)
    }

    return {
        success: true
    }
})

function failure(error: string) {
    return {
        success: false,
        error
    }
}
