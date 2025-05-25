'use client';

import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {usePathname, useRouter} from 'next/navigation';
import Cookies from "js-cookie";

function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const hiddenRoutes = ['/login', '/register'];


    useEffect(() => {
        const fetchUser = async () => {
            const token =  Cookies.get('token');
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
                    Cookies.remove('token');
                    router.push('/login');
                }
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchUser();
    }, [router]);
    if (hiddenRoutes.includes(pathname)) {
        return null;
    }

    return (
        <div className="max-w-full mx-auto p-4 border rounded shadow">
            <Link href={'/'}>Home</Link>
        </div>
    );
}

export default Navbar;
