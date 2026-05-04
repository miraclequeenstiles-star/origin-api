import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profile() {
    const [data, setData] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: s }) => {
            const token = s.session.access_token;

            const res = await fetch('/api/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const json = await res.json();
            setData(json);
        });
    }, []);

    if (!data) return <p>Loading...</p>;

    return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
            <h2>{data.full_name}</h2>
            <p>Time: {data.remaining_seconds}s</p>
        </div>
    );
}