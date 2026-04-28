import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'Missing user_id' });
        }

        // Check user time
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('remaining_seconds, full_name')
            .eq('id', user_id)
            .single();

        if (error || !profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (profile.remaining_seconds <= 0) {
            return res.status(403).json({ error: 'No remaining time' });
        }

        // Return secured server-side key
        return res.status(200).json({
            success: true,
            apiKey: process.env.DECART_API_KEY,
            user: profile.full_name,
            seconds: profile.remaining_seconds
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message || 'Server error'
        });
    }
}
