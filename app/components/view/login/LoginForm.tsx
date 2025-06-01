/* eslint-disable */
'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from "next/link";
import Cookies from "js-cookie"
import {Input} from "@/app/components/assets/ui/Input";
import LoadingMini from "@/app/components/assets/ui/LoadingMini";

export default function LoginForm() {
    const [email, setEmail] = useState<string | undefined>('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            const data = await res.json();

            if (res.ok) {
                setLoading(false)
                Cookies.set("token", data.token, {expires: 1});
                setResult(`Login successful! WellCome ${data.user.name}`);
                setTimeout(() => router.push('/'), 500);
            } else {
                setLoading(false)
                setResult(`Error: ${data.error}`);
            }
        } catch (error) {
            setLoading(false)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-expect-error
            setResult(`Error: ${error.message}`);
        }
    };
    useEffect(() => {
        const email : any = Cookies.get('email');
        if (email !== undefined){
            setEmail(email);
        }
    }, []);
    return (
        <div className="max-w-md mx-auto mt-10 p-4  rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Log In</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block">Email</label>
                    <Input
                        type="email"
                        className="w-full text-black p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block">Password</label>
                    <Input
                        type="password"
                        className="w-full text-black p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="bg-green-950 disabled:opacity-20 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span
                        className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    Log In
                </button>
                <button
                    className="mx-2 bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                    <span
                        className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    <Link
                        href={'/register'}
                    >
                        Sign Up
                    </Link>
                </button>
            </form>

            {loading ? <LoadingMini/> :
                result && (
                    <pre className="mt-4 p-2 animate-pulse duration-1000 text-black bg-gray-100 rounded text-sm overflow-x-auto">
          {result}
        </pre>
                )}
        </div>
    );
}