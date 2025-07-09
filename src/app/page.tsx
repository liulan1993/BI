"use client";

import React, { useEffect } from 'react';
import AppHeader from '@/components/ui/AppHeader';
import DemoHeroGeometric from '@/components/ui/HeroSection';
import InteractiveCanvas from '@/components/ui/InteractiveCanvas'; // 恢复了 InteractiveCanvas

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
        <main className="flex-grow relative z-10 flex flex-col">
            {/* 欢迎界面部分，现在是 main 的直接子元素，可以占据完整宽度 */}
            <div className="pt-40">
                <DemoHeroGeometric />
            </div>
            
            {/* 其他内容的容器，这里应用了内边距 */}
            <div className="px-32 pb-16">
                {/* 空白占位符，用于延长页面内容区域 */}
                <div className="h-[3000px] w-full">
                    {/* 您可以在此区域内或之后添加更多组件 */}
                </div>
            </div>
        </main>
    </div>
  );
};

export default Page;
