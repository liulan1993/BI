"use client";

import React from 'react';
import PixelCanvas from './PixelCanvas';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
    const buttonClasses = `
        group relative w-full h-[50px] flex-shrink-0 
        border rounded-full 
        transition-colors duration-200 
        focus:outline-none
        ${isActive ? 'border-[#0cf2a0]' : 'border-gray-600'}
    `;

    return (
        <button
            onClick={onClick}
            className={buttonClasses.trim().replace(/\s+/g, ' ')}
            style={{ "--active-color": "#0cf2a0" } as React.CSSProperties}
        >
            <PixelCanvas
                gap={10}
                speed={25}
                colors={["#056b46", "#08a169", "#0cf2a0"]}
                variant="icon"
                animationState={isActive ? "appear" : "disappear"}
            />
            <div className="relative z-10 h-full w-full flex items-center justify-center p-2">
                <span className={`text-center text-sm font-bold transition-all duration-300 ease-out ${isActive ? 'text-[var(--active-color)] scale-105' : 'text-gray-300'}`}>
                    {children}
                </span>
            </div>
        </button>
    );
};

export default TabButton;
