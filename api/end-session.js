import { supabaseAdmin, getUserFromToken } from '../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await getUserFromToken(req);

        const { session_id, used_seconds } = req.body;

        if (!session_id)
            return res.status(400).json({ error: 'Missing session_id' });

        // 🔍 get session
        const { data: session, error } = await supabaseAdmin
            .from('sessions')
            .select('*')
            .eq('id', session_id)
            .single();

        if (error || !session)
            return res.status(404).json({ error: 'Session not found' });

        if (session.user_id !== user.id)
            return res.status(403).json({ error: 'Unauthorized' });

        if (session.status !== 'active')
            return res.status(400).json({ error: 'Already closed' });

        // 🔥 REAL TIME (SERVER TRUSTED)
        const start = new Date(session.start_time).getTime();
        const now = Date.now();

        const real_used = Math.floor((now - start) / 1000);

        // 🔒 pick safest value
        const final_used = Math.min(
            used_seconds || 0,
            real_used,
            session.max_duration_seconds
        );

        const new_remaining =
            session.remaining_at_start - final_used;

        // 🔄 update profile
        await supabaseAdmin
            .from('profiles')
            .update({
                remaining_seconds: Math.max(0, new_remaining),
                total_used_seconds:
                    (session.total_used_seconds || 0) + final_used
            })
            .eq('id', user.id);

        // 🔄 close session
        await supabaseAdmin
            .from('sessions')
            .update({
                status: 'ended',
                end_time: new Date().toISOString(),
                used_seconds: final_used
            })
            .eq('id', session_id);

        return res.status(200).json({
            success: true,
            remaining_seconds: Math.max(0, new_remaining)
        });

    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
}