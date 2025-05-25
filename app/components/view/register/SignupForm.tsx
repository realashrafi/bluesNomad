'use client';

import {useState} from 'react';
import Link from "next/link";

export default function SignupForm() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password, name}),
            });

            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (error: any) {
            setResult(`Error: ${error.message}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block">Name</label>
                    <input
                        type="text"
                        className="w-full text-black p-2 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
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
                    Sign Up
                </button>
                <Link
                    href={'/login'}
                    className="bg-blue-600 text-white mx-2 px-4 py-[10px] rounded hover:bg-blue-700"
                >
                    Sign In
                </Link>
            </form>
            {result && (
                <pre className="mt-4 p-2 text-black bg-gray-100 rounded text-sm overflow-x-auto">
          {result}
        </pre>
            )}
        </div>
    );
}
