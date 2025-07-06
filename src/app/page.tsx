"use client";

import React, { useEffect } from 'react';
import AppHeader from '@/components/ui/AppHeader';
import InteractiveCanvas from '@/components/ui/InteractiveCanvas';
import DemoHeroGeometric from '@/components/ui/HeroSection';
// 新增：导入健康图表组件
import { HealthMetricChart } from "@/components/ui/HealthMetricChart";

/**
 * 页面主组件
 * @description 组装各个UI组件来构建完整的页面，包含交互式背景、导航、Hero区域和健康仪表盘。
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
        <main className="flex-grow relative z-10 px-4 pt-24 pb-16">
            <div className="flex flex-col items-center text-center">
                {/* Hero 区域 */}
                <DemoHeroGeometric />

                {/* 健康仪表盘区域 */}
                <div className="w-full max-w-6xl mt-16">
                    <header className="mb-8">
                      <h1 className="text-3xl font-bold tracking-tight">健康仪表盘</h1>
                      <p className="text-muted-foreground">您最近的健康指标概览</p>
                    </header>

                    {/* 使用网格布局来展示多个图表 */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      
                      {/* 第一个图表：心率 */}
                      <HealthMetricChart
                        metricName="心率"
                        title="实时心率"
                        description="您当前的静息心率"
                        maxValue={120} // 假设正常静息心率最大值为 120 BPM
                        unit="BPM"
                      />

                      {/* 第二个图表：体重 */}
                      <HealthMetricChart
                        metricName="体重"
                        title="当前体重"
                        description="您最近一次记录的体重"
                        maxValue={100} // 假设目标体重或一个参考最大值为 100 kg
                        unit="kg"
                      />

                      {/* 第三个图表：体脂率 */}
                      <HealthMetricChart
                        metricName="体脂率"
                        title="体脂率"
                        description="身体脂肪所占百分比"
                        maxValue={30} // 假设一个参考最大体脂率为 30%
                        unit="%"
                      />
                      
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};

export default Page;
