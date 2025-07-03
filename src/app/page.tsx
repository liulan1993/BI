"use client";

import React, { useState } from 'react';
import GlobalStyles from '@/components/ui/GlobalStyles';
import InteractiveHero from '@/components/ui/InteractiveHero';
import PlaceholderSection from '@/components/ui/PlaceholderSection';


const Page = () => {
    // 移除了未使用的 pageRef, pageHeight, setPageHeight, 和 useEffect
    const [themeColor] = useState<`#${string}`>('#00f5c3');

    return (
        <div 
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
