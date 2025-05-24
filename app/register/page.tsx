import React from 'react';
import SignupForm from "@/app/components/view/register/SignupForm";

function Page() {
    const uri = process.env.MONGODB_URI!;
    console.log('uri',uri)
    return (
        <div>
            <SignupForm/>
        </div>
    );
}

export default Page;