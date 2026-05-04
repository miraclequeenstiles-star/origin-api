import { createClient } from '@supabase/supabase-js';

// 🔒 SERVICE ROLE (server only)
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔐 USER AUTH VALIDATION
export async function getUserFromToken(req) {
    const auth = req.headers.authorization;

    if (!auth) throw new Error('Missing token');

    const token = auth.replace('Bearer ', '');

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) throw new Error('Invalid token');

    return data.user;
}