import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Loading: React.FC = () => {
    const { RefrachisLoading } = useAuth();

    return (
        <>
            <div
                className={`fixed z-50 inset-0 bg-white flex items-center justify-center transition-opacity duration-500 ease-in-out
        ${RefrachisLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
            >
                {RefrachisLoading ?
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    : <></>}

            </div>
        </>
    );
};

export default Loading;
