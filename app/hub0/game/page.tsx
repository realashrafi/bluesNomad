import React from 'react';
import Link from "next/link";

function Page() {
    return (
        <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
            <Link href={'/hub0/game/memory-flip-color'}>Memory Flip Color Game</Link>
        </div>
    );
}

export default Page;