'use client';

import React, {useEffect} from 'react';
import Link from "next/link";
import {usePathname, useRouter} from 'next/navigation';
import Cookies from "js-cookie";
import {Vortex} from "@/app/components/assets/ui/vortex";

function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const hiddenRoutes = ['/login', '/register','/hub0/game/zboom'];


    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token');
            if (!token) {
                // setError('No token found. Please log in.');
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const data = await res.json();
                if (res.ok) {
                    // setUser(data.user);
                } else {
                    // setError(data.error);
                    Cookies.remove('token');
                    router.push('/login');
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                // setError(err.message);
            }
        };

        fetchUser();
    }, [router]);
    if (hiddenRoutes.includes(pathname)) {
        return null;
    }

    return (
        <Vortex
            backgroundColor="black"
            rangeY={800}
            particleCount={100}
            baseHue={220}
            className="max-w-full mx-auto text-green-400 p-4 bg-transparent rounded shadow "
        >
            <Link href={'/'}>Home</Link>
        </Vortex>
    );
}

export default Navbar;
