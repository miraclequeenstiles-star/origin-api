import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token' });
        }

        // ✅ YOUR TOKEN SYSTEM
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        const { data: profile } = await supabase
            .from('profiles')
            .select('remaining_seconds')
            .eq('id', userId)
            .single();

        if (!profile || profile.remaining_seconds <= 0) {
            return res.status(403).json({ error: 'No time left' });
        }

        const { data: session } = await supabase
            .from('sessions')
            .insert([{ user_id: userId, start_time: new Date() }])
            .select()
            .single();

        return res.status(200).json({
            success: true,
            session_id: session.id,
            seconds: profile.remaining_seconds
        });

    } catch (err) {
        console.error("CRASH:", err);
        return res.status(500).json({ error: err.message });
    }
}