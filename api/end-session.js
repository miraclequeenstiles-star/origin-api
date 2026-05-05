import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ error: 'Missing session_id' });
        }

        // =========================
        // GET SESSION
        // =========================
        const { data: session, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', session_id)
            .single();

        if (error || !session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.end_time) {
            return res.status(400).json({ error: 'Session already ended' });
        }

        // =========================
        // CALCULATE TIME (SERVER SIDE)
        // =========================
        const start = new Date(session.start_time).getTime();
        const end = Date.now();

        let seconds_used = Math.floor((end - start) / 1000);

        if (seconds_used < 0) seconds_used = 0;

        // Optional safety cap (anti exploit / long freeze)
        if (seconds_used > 36000) // 10 hours max
            seconds_used = 36000;

        // =========================
        // UPDATE SESSION
        // =========================
        await supabase
            .from('sessions')
            .update({
                end_time: new Date(),
                seconds_used
            })
            .eq('id', session_id);

        // =========================
        // DEDUCT FROM USER
        // =========================
        await supabase.rpc('deduct_time', {
            user_id_input: session.user_id,
            seconds_input: seconds_used
        });

        return res.status(200).json({
            success: true,
            seconds_used
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}