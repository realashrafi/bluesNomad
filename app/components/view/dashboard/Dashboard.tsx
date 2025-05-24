'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in.');
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (res.ok) {
                    setUser(data.user);
                } else {
                    setError(data.error);
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchUser();
    }, [router]);

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!user) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p><strong>Email:</strong> {user.email}</p>
            {user.name && <p><strong>Name:</strong> {user.name}</p>}
            <button
                onClick={() => {
                    localStorage.removeItem('token');
                    router.push('/login');
                }}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
                Log Out
            </button>
        </div>
    );
}