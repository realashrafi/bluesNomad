'use client'
import React from 'react';
import {usePathname} from "next/navigation";
import BackRouter from "@/app/components/assets/ui/BackRouter";

function ChildrenLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hiddenRoutes = ['/login', '/register','/hub0/game/zboom'];
    return (
        <div className={`pt-2 pb-4 ${hiddenRoutes.includes(pathname) ? 'min-h-100vh h-screen' : 'min-h-[calc(100vh-56px)]'} bg-[url('/images/background1.png')]  bg-cover bg-fixed bg-center`}>
            <BackRouter/>
            {children}
        </div>
    );
}

export default ChildrenLayout;