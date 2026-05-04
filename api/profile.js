import { supabaseAdmin, getUserFromToken } from '../lib/supabase';

export default async function handler(req, res) {
    try {
        const user = await getUserFromToken(req);

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error)
            return res.status(404).json({ error: 'Not found' });

        return res.status(200).json(data);

    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
}