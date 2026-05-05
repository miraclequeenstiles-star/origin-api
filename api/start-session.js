import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // =========================
        // AUTH
        // =========================
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token' });
        }

        // =========================
        // AUTH (FIXED)
        // =========================
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token' });
        }

        const { data: { user }, error: authError } =
            await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = user.id;

        // =========================
        // CHECK USER TIME
        // =========================
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('remaining_seconds')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (profile.remaining_seconds <= 0) {
            return res.status(403).json({ error: 'No time left' });
        }

        // =========================
        // CREATE SESSION
        // =========================
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert([
                {
                    user_id: userId,
                    start_time: new Date(),
                    end_time: null,
                    seconds_used: 0
                }
            ])
            .select()
            .single();

        if (sessionError || !session) {
            return res.status(500).json({ error: 'Failed to create session' });
        }

        // =========================
        // RESPONSE
        // =========================
        return res.status(200).json({
            success: true,
            session_id: session.id,          // 🔥 CRITICAL
            decartKey: process.env.DECART_API_KEY,
            seconds: profile.remaining_seconds
        });

    } catch (err) {
        return res.status(401).json({
            error: 'Invalid token'
        });
    }
}