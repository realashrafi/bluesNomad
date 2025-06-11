'use client'
import React from 'react';
import {usePathname, useRouter} from "next/navigation";
import {GoArrowLeft} from "react-icons/go";

function BackRouter() {
    const router = useRouter();
    const pathname = usePathname();
    const hiddenRoutes = ['/login', '/register', '/','/hub0/game/zboom','/hub0/game/admin/wheel'];
    if (hiddenRoutes.includes(pathname)) {
        return null;
    }


    return (
        <div className={'flex items-center justify-center -mb-10 mt-2'}>
            <button
                onClick={() => {
                    router.back();
                }}
                className="bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
        <span
            className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
              <span className={'flex gap-1 items-center justify-center'}>
                   <GoArrowLeft/> Back
              </span>
            </button>
        </div>
    );
}

export default BackRouter;