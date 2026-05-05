import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email, password, mode } = req.body;

        if (!email || !password || !mode) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // ================= REGISTER =================
        if (mode === 'register') {
            const hash = await bcrypt.hash(password, 10);

            const { data, error } = await supabase
                .from('profiles')
                .insert([{
                    email,
                    password_hash: hash,
                    remaining_seconds: 600 // default time
                }])
                .select()
                .single();

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            const token = jwt.sign(
                { user_id: data.id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                token,
                user_id: data.id
            });
        }

        // ================= LOGIN =================
        if (mode === 'login') {
            const { data: user, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const valid = await bcrypt.compare(password, user.password_hash);

            if (!valid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { user_id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                token,
                user_id: user.id
            });
        }

        return res.status(400).json({ error: 'Invalid mode' });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}