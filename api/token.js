import { createClient } from '@supabase/supabase-js';
import { createDecartClient } from '@decartai/sdk';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const decart = createDecartClient({
    apiKey: process.env.DECART_API_KEY
});

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { user_id } = req.body;

        if (!user_id)
            return res.status(400).json({ error: 'Missing user_id' });

        // Check billing/time
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('remaining_seconds, full_name')
            .eq('id', user_id)
            .single();

        if (error || !profile)
            return res.status(404).json({ error: 'User not found' });

        if (profile.remaining_seconds <= 0)
            return res.status(403).json({
                error: 'No remaining time'
            });

        // Create short-lived Decart token
        const token = await decart.tokens.create({
            expiresIn: 120,
            allowedModels: ['lucy-2'],
            constraints: {
                realtime: {
                    maxSessionDuration: profile.remaining_seconds
                }
            }
        });

        return res.status(200).json({
            success: true,
            apiKey: token.apiKey,
            expiresAt: token.expiresAt,
            user: profile.full_name,
            seconds: profile.remaining_seconds
        });

    } catch (err) {
        return res.status(500).json({
            error: 'Server error'
        });
    }
}