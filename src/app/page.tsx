"use client";

import React, { useEffect } from 'react';
import AppHeader from '@/components/ui/AppHeader';
import DemoHeroGeometric from '@/components/ui/HeroSection';
import InteractiveCanvas from '@/components/ui/InteractiveCanvas';
import ModuleDashboard from '@/components/ui/ModuleDashboard';
import RadialGaugeChart from '@/components/ui/RadialGaugeChart'; // 1. 导入新的图表组件

/**
 * 页面主组件
 * @description 组装各个UI组件来构建完整的页面。
 */
const Page = () => {
  // 添加此效果以确保 body 背景与主题匹配
  useEffect(() => {
    document.body.style.backgroundColor = '#111111';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="relative bg-[#111111] text-gray-300 min-h-screen flex flex-col">
        {/* 全局背景 Canvas */}
        <InteractiveCanvas />

        {/* 导航栏 */}
        <AppHeader />

        {/* 主内容区域 */}
        <main className="flex-grow relative z-10 flex flex-col items-center">
            {/* 欢迎界面部分 */}
            <div className="pt-40 w-full">
                <DemoHeroGeometric />
            </div>

            {/* 2. 将图表组件放置在此处 */}
            <div className="py-20 w-full flex justify-center">
                <RadialGaugeChart />
            </div>
            
            {/* 模块仪表盘部分 */}
            <div className="py-20 w-full flex justify-center">
                <ModuleDashboard />
            </div>

            {/* 其他可能的内容 */}
            <div className="h-[1000px] w-full">
                {/* 您可以在此区域内或之后添加更多组件 */}
            </div>
        </main>
    </div>
  );
};

export default Page;
