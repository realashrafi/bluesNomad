import React from 'react';

function LoadingMini() {
    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-4 h-4 rounded-full bg-green-400 animate-bounce"></div>
            <div
                className="w-4 h-4 rounded-full bg-green-400 animate-bounce [animation-delay:-.3s]"
            ></div>
            <div
                className="w-4 h-4 rounded-full bg-green-400 animate-bounce [animation-delay:-.5s]"
            ></div>
        </div>
    );
}

export default LoadingMini;