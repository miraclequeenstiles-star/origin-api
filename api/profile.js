import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { token } = req.body;

        if (!token)
            return res.status(401).json({ error: 'Missing token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, remaining_seconds')
            .eq('id', decoded.user_id)
            .single();

        if (error || !data)
            return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(data);

    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}