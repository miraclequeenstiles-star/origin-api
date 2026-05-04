import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) alert(error.message);
        else window.location.href = '/profile';
    };

    const register = async () => {
        const { error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) alert(error.message);
        else alert('Check your email');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
            <h2>Auth</h2>

            <input placeholder="email" onChange={e => setEmail(e.target.value)} />
            <input placeholder="password" type="password"
                onChange={e => setPassword(e.target.value)} />

            <br /><br />

            <button onClick={login}>Login</button>
            <button onClick={register}>Register</button>
        </div>
    );
}