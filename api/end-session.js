import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { session_id, seconds_used } = req.body;

        if (!session_id || !seconds_used) {
            return res.status(400).json({ error: 'Missing data' });
        }

        const { data: session } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', session_id)
            .single();

        if (!session)
            return res.status(404).json({ error: 'Session not found' });

        // Update session
        await supabase
            .from('sessions')
            .update({
                end_time: new Date(),
                seconds_used
            })
            .eq('id', session_id);

        // Deduct time safely
        await supabase.rpc('deduct_time', {
            user_id_input: session.user_id,
            seconds_input: seconds_used
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}