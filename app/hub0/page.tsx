import Link from 'next/link';
import React from 'react';

function Page() {
    return (
        <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
            <Link href={'/hub0/game'}>GAME</Link>
        </div>
    );
}

export default Page;