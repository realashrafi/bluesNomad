import React from 'react';
import Dashboard from "@/app/components/view/dashboard/Dashboard";
import Link from "next/link";

function Page() {
    return (
        <div>
          <Dashboard/>
            <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
                <Link href={'/dashboard'}>Dashboard</Link>
            </div>
        </div>
    );
}

export default Page;