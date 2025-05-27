import React from 'react';
import Link from "next/link";
import {GlowingEffectView} from "@/app/components/assets/ui/GlowingEffectView";
import { LuSaveAll } from "react-icons/lu";
function Page() {
    const itemsPage = [
        {
            id: 1,
            title: 'Memory Flip Color Game',
            description: <Link href={'/hub0/game/memory-flip-color'}>
                <button
                    className=" bg-green-950 text-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
        <span
            className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                    Go
                </button>
            </Link>,
            icon: <LuSaveAll/>,
        },
    ]

    return (
        <div className="flex items-center justify-center mx-auto mt-10 p-4 rounded shadow">
            <GlowingEffectView items={itemsPage}/>
        </div>
    );
}

export default Page;