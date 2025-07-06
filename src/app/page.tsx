"use client";

import React, { useEffect } from 'react';
import AppHeader from '@/components/ui/AppHeader';
import InteractiveCanvas from '@/components/ui/InteractiveCanvas';
import DemoHeroGeometric from '@/components/ui/HeroSection';

/**
 * 页面主组件
 * @description 组装各个UI组件来构建完整的页面。
 */
const Page = () => {
  // 添加此效果以确保 body 背景与主题匹配，从而解决底部白边问题
  useEffect(() => {
    document.body.style.backgroundColor = '#111111';
    // 在组件卸载时进行清理
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []); // 空依赖数组确保此效果仅在组件挂载时运行一次

  return (
    <div className="relative bg-[#111111] text-gray-300 min-h-screen flex flex-col">
        {/* Canvas 背景 */}
        <InteractiveCanvas />

        {/* 导航栏 */}
        <AppHeader />

        {/* 主内容区域 */}
        <main className="flex-grow relative z-10 px-32 pt-40 pb-16">
            {/* 容器 1: 专门用于居中内容 */}
            <div className="flex flex-col items-center text-center">
                <DemoHeroGeometric />
            </div>

            {/* 空白占位符，用于延长页面内容区域 */}
            <div className="h-[3000px] w-full">
                {/* 您可以在此区域内或之后添加更多组件 */}
            </div>
        </main>
    </div>
  );
};

export default Page;
