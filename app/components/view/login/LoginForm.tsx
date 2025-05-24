'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // ذخیره توکن در localStorage
                localStorage.setItem('token', data.token);
                setResult('Login successful! Redirecting to dashboard...');
                // انتقال به داشبورد
                setTimeout(() => router.push('/'), 1000);
            } else {
                setResult(`Error: ${data.error}`);
            }
        } catch (error: any) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Log In</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block">Email</label>
                    <input
                        type="email"
                        className="w-full text-black p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block">Password</label>
                    <input
                        type="password"
                        className="w-full text-black p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Log In
                </button>
            </form>
            {result && (
                <pre className="mt-4 p-2 text-black bg-gray-100 rounded text-sm overflow-x-auto">
          {result}
        </pre>
            )}
        </div>
    );
}