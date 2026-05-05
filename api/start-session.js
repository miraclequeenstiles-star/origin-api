import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    console.log("STEP 1");

    try {
        console.log("STEP 2");

        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error("CRASH:", err);
        return res.status(500).json({ error: err.message });
    }
}