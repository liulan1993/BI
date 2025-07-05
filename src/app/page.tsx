"use client";

import React from 'react';
import AppHeader from '@/components/ui/AppHeader';
import InteractiveCanvas from '@/components/ui/InteractiveCanvas';
import DemoHeroGeometric from '@/components/ui/HeroSection';
import HealthMetricsTabs from '@/components/ui/HealthMetricsTabs';

/**
 * 页面主组件
 * @description 组装各个UI组件来构建完整的页面。
 */
const Page = () => {
  return (
    <div className="relative bg-[#111111] text-gray-300 min-h-screen flex flex-col">
        {/* Canvas 背景 */}
        <InteractiveCanvas />

        {/* 导航栏 */}
        <AppHeader />

        {/* 主内容区域 */}
        <main className="flex-grow relative z-10 px-4 pt-24 pb-16">
            <div className="flex flex-col items-center text-center">
                <DemoHeroGeometric />
                <HealthMetricsTabs />
            </div>
        </main>
    </div>
  );
};

export default Page;
