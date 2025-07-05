"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedRadialChart from './AnimatedRadialChart';
import InteractiveMenu from './InteractiveMenu';
import VascularHealthDashboard from './VascularHealthDashboard';

// --- 四个不同领域的标签页数据 ---
const cardiovascularMetabolicData = [
   { id: '1', title: '核心血压与血管健康', content: <VascularHealthDashboard /> },
   { id: '2', title: '动脉粥样硬化风险矩阵', content: '图表展示区' },
   { id: '3', title: '心脏结构与功能快照', content: '图表展示区' },
   { id: '4', title: '心脏泵血效率与电生理', content: '图表展示区' },
   { id: '5', title: '胰岛素抵抗与糖脂毒性', content: '图表展示区' },
   { id: '6', title: '全身代谢与脂肪分布', content: '图表展示区' },
];

const inflammationImmunityNutritionData = [
   { id: '7', title: '系统性炎症信号簇', content: '图表展示区' },
   { id: '8', title: '营养与预后综合评估', content: '图表展示区' },
   { id: '9', title: '蛋白代谢与特殊炎症', content: '图表展示区' },
   { id: '10', title: '特殊免疫与综合状态', content: '图表展示区' },
];

const multiOrganFunctionData = [
   { id: '11', title: '肝脏健康全景图', content: '图表展示区' },
   { id: '12', title: '肾功能精密监测', content: '图表展示区' },
   { id: '13', title: '血液系统与凝血功能', content: '图表展示区' },
   { id: '14', title: '内分泌与生殖健康', content: '图表展示区' },
   { id: '15', title: '消化、骨骼与感官系统', content: '图表展示区' },
];
    
const integrativeMedicineData = [
   { id: '16', title: '系统性风险评分卡', content: '图表展示区' },
   { id: '17', title: '跨系统失调网络', content: '图表展示区' },
   { id: '18', title: '宏观健康状态与生物年龄', content: '图表展示区' },
   { id: '19', title: '中医证候与微生态量化', content: '图表展示区' },
];

const HealthMetricsTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const chartData = [
    { title: "心血管-代谢域", value: 97 },
    { title: "炎症-免疫-营养域", value: 95 },
    { title: "多器官功能域", value: 90 },
    { title: "整合医学与跨领域", value: 93 },
  ];

  const tabContent = [
    <InteractiveMenu key="cardio" data={cardiovascularMetabolicData} />,
    <InteractiveMenu key="inflammation" data={inflammationImmunityNutritionData} />,
    <InteractiveMenu key="organ" data={multiOrganFunctionData} />,
    <InteractiveMenu key="integrative" data={integrativeMedicineData} />,
  ];

  return (
    <div className="w-full py-16">
        {/* Tabs Header */}
        <div className="flex flex-wrap justify-center gap-8">
            {chartData.map((chart, index) => (
                <div
                    key={index}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => setActiveTab(index)}
                >
                    <div className="relative py-2">
                        <h3 className="text-3xl font-bold text-white">
                            {chart.title}
                        </h3>
                        {activeTab === index && (
                            <motion.div
                                className="absolute bottom-[-2px] left-1/4 w-1/2 h-0.5 bg-[#0cf2a0]"
                                layoutId="underline"
                            />
                        )}
                    </div>
                    <AnimatedRadialChart
                        value={chart.value}
                        size={300}
                        strokeWidth={30}
                        showLabels={true}
                        duration={2}
                    />
                </div>
            ))}
        </div>

        {/* Tabs Content Panel - 移除了固定的高度，让内容自然撑开 */}
        <div className="mt-12 w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {tabContent[activeTab]}
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
}

export default HealthMetricsTabs;
