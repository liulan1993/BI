"use client";

import React, { useState, useEffect, useRef } from 'react';
import GlobalStyles from '@/components/ui/GlobalStyles';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import RainEffect from '@/components/ui/RainEffect';
import InteractiveHero from '@/components/ui/InteractiveHero';
import PlaceholderSection from '@/components/ui/PlaceholderSection';


const Page = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const [pageHeight, setPageHeight] = useState(0);
    // 移除了未使用的 setThemeColor
    const [themeColor] = useState<`#${string}`>('#00f5c3');

    useEffect(() => {
        const pageElement = pageRef.current;
        if (!pageElement) return;

        const resizeObserver = new ResizeObserver(() => {
            setPageHeight(pageElement.scrollHeight);
        });

        resizeObserver.observe(pageElement);
        setPageHeight(pageElement.scrollHeight);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div 
            ref={pageRef} 
            className="relative" 
            style={{ '--theme-color': themeColor } as React.CSSProperties}
        >
            <GlobalStyles />
                     
            <main className="relative z-10">
                <InteractiveHero />
                <PlaceholderSection title="功能介绍" />
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />
                <PlaceholderSection title="功能介绍" />
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />             
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />
            </main>
        </div>
    );
};

export default Page;
