import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        const { token } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data } = await supabase
            .from('profiles')
            .select('full_name, remaining_seconds')
            .eq('id', decoded.user_id)
            .single();

        return res.json({
            success: true,
            user: data.full_name,
            seconds: data.remaining_seconds
        });

    } catch {
        return res.json({ success: false });
    }
}