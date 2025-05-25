import React from 'react';

function ChildrenLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={'pt-2'}>
            {children}
        </div>
    );
}

export default ChildrenLayout;