import {serverSupabaseServiceRole} from "#supabase/server";
import {SupabaseClient} from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
    const client: SupabaseClient = serverSupabaseServiceRole(event);
    const body = await readBody(event);

    if (!body.token) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Token not provided.',
        })
    }

    const turnstile = await verifyTurnstileToken(body.token);

    if (!turnstile.success) {
        return {
            success: false,
            error: "Turnstile failed. Please try again."
        }
    }

    // Check for username availability
    const { data: uCheckData, error: uCheckError } = client.from('users').select('id').eq('username', body.username);
    if (uCheckError) {
        return {
            success: false,
            error: uCheckError.message
        }
    }

    if (uCheckData !== undefined) {
        return {
            success: false,
            error: 'Username is already taken'
        }
    }

    const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: body.email,
        password: body.password
    });

    if (signUpError) {
        return {
            success: false,
            error: signUpError.message
        }
    }

    // Create user row in database
    const { data: createUserData, error: createUserError } = await client.from('users').insert({
        id: signUpData.id,
        username: body.username,
    });

    if (createUserError) {
        return {
            success: false,
            error: createUserError.message
        }
    }

    return {
        success: true
    }
});
