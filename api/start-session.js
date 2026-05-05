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
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        // get user
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

        // ✅ RETURN DEPART API KEY SECURELY
        return res.status(200).json({
            success: true,
            decartKey: process.env.DECART_API_KEY,
            seconds: profile.remaining_seconds
        });

    } catch (err) {
        return res.status(401).json({
            error: 'Invalid token'
        });
    }
}