import { supabaseAdmin, getUserFromToken } from '../lib/supabase';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await getUserFromToken(req);

        // 🔍 get user profile
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('remaining_seconds')
            .eq('id', user.id)
            .single();

        if (error || !profile)
            return res.status(404).json({ error: 'User not found' });

        if (profile.remaining_seconds <= 0)
            return res.status(403).json({ error: 'No time left' });

        // 🔥 ensure no active session
        const { data: active } = await supabaseAdmin
            .from('sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (active) {
            return res.status(409).json({
                error: 'Session already active'
            });
        }

        // 🔥 create session
        const session_id = crypto.randomUUID();

        await supabaseAdmin.from('sessions').insert({
            id: session_id,
            user_id: user.id,
            remaining_at_start: profile.remaining_seconds,
            status: 'active'
        });

        return res.status(200).json({
            session_id,
            remaining_seconds: profile.remaining_seconds
        });

    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
}