import React from 'react';

function Loading() {
    return (
        <div className=" fixed inset-0 flex items-center justify-center min-h-screen">
            <div className="relative">
                <div className="relative w-32 h-32">
                    <div
                        className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-yellow-500 border-b-yellow-500 animate-spin"
                        style={{animationDuration: '3s'}}
                    ></div>

                    <div
                        className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-yellow-500 animate-spin"
                        style={{animationDuration: "2s", animationDirection: "reverse"}}
                    ></div>
                </div>

                <div
                    className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-yellow-500/5 animate-pulse rounded-full blur-sm"
                ></div>
            </div>
        </div>

    );
}

export default Loading;