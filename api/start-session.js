import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    console.log("STEP 1");

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log("STEP 2 - supabase created");

        console.log("URL:", process.env.SUPABASE_URL);
        console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING");

        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error("CRASH:", err);
        return res.status(500).json({ error: err.message });
    }
}