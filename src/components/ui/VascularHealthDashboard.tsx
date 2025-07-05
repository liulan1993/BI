"use client";

import React, { useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';

// --- Helper function and Type Definitions ---
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

type HealthData = {
  time: string;
  pp: number;
  map: number;
  abi: number;
  cavi: number;
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        name: string;
        value: string | number;
        payload: HealthData;
        color: string;
        stroke: string;
    }[];
    label?: string | number;
}

interface ChartCardInfo {
    id: string;
    title: string;
    description: string;
    details: string;
}

// --- Component Data ---

const healthData: HealthData[] = [
  { time: '2023 Q1', pp: 45, map: 85, abi: 1.1, cavi: 7.5 },
  { time: '2023 Q2', pp: 48, map: 88, abi: 1.12, cavi: 7.6 },
  { time: '2023 Q3', pp: 52, map: 92, abi: 1.08, cavi: 7.8 },
  { time: '2023 Q4', pp: 55, map: 95, abi: 1.05, cavi: 7.9 },
  { time: '2024 Q1', pp: 58, map: 98, abi: 1.02, cavi: 8.1 },
  { time: '2024 Q2', pp: 61, map: 101, abi: 0.98, cavi: 8.3 },
  { time: '2024 Q3', pp: 63, map: 103, abi: 0.95, cavi: 8.5 },
  { time: '2024 Q4', pp: 65, map: 105, abi: 0.92, cavi: 8.8 },
  { time: '2025 Q1', pp: 68, map: 108, abi: 0.89, cavi: 9.1 },
  { time: '2025 Q2', pp: 66, map: 106, abi: 0.91, cavi: 9.0 },
];

const chartConfig = {
  pp: { label: "脉压 (PP)", color: "#E53E3E" },
  map: { label: "平均动脉压 (MAP)", color: "#3182CE" },
  abi: { label: "踝臂指数 (ABI)", color: "#38A169" },
  cavi: { label: "心踝血管指数 (CAVI)", color: "#DD6B20" },
};

const chartCardsInfo: ChartCardInfo[] = [
    {
        id: 'core_pressure',
        title: '核心血压',
        description: '脉压 (PP) & 平均动脉压 (MAP)',
        details: '【脉压(PP)过高】: 你的大动脉正在失去弹性，变得像一根僵硬的铁管。心脏每次泵血时，压力无法被有效缓冲，形成了巨大的压力“浪涌”，冲击全身微小血管。\n\n【平均动脉压(MAP)过高】: 你的整个循环系统长期处于过高压力之下，这是所有重要器官血管正在承受的、24小时不间断的过度负荷，会加速器官的老化和衰竭。'
    },
    {
        id: 'abi',
        title: '外周血管',
        description: '踝臂指数 (ABI)',
        details: '【踝臂指数(ABI)过低】: 你的下肢血管正在“堵塞”。这个简单的比值直接反映了从心脏到腿部的动脉是否存在狭窄或闭塞。它不仅意味着走路可能腿痛，更是一个全身性动脉粥样硬化的强烈信号，你的心脏和大脑的血管很可能也存在同样的问题。'
    },
    {
        id: 'cavi',
        title: '动脉硬度',
        description: '心踝血管指数 (CAVI)',
        details: '【心踝血管指数(CAVI)过高】: 你的大动脉系统正在全面“硬化”。CAVI评估从心脏到脚踝整个动脉系统的“僵硬度”。高CAVI意味着你的血管失去了弹性，无法有效缓冲心脏泵血的压力波，这会反过来增加心脏的后负荷，并损害大脑和肾脏的微循环。'
    }
];

// --- UI Components ---

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-white/80 border border-gray-300 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-bold text-gray-900 mb-1">{`${label}`}</p>
        {payload.map((pld) => (
          <p key={pld.name} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DetailPanel = ({ info }: { info: ChartCardInfo | null }) => {
    if (!info) {
        return (
            <div className="p-6 rounded-lg border border-dashed border-gray-300 h-full flex items-center justify-center text-gray-500 bg-white">
                点击左侧图表查看详细信息
            </div>
        );
    }
    return (
        <div className="p-6 rounded-lg border border-gray-200 h-full bg-white shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-md text-gray-600 mb-4">{info.description}</p>
            <div className="space-y-4 text-gray-700 whitespace-pre-wrap">
                <p className="text-base leading-relaxed">{info.details}</p>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

export default function VascularHealthDashboard() {
  const [selectedCardId, setSelectedCardId] = useState<string>(chartCardsInfo[0].id);

  const renderChart = (id: string) => {
      switch(id) {
          case 'core_pressure':
              return (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                          <ReferenceArea y1={70} y2={100} fill="rgba(56, 161, 105, 0.1)" stroke="transparent" />
                          <ReferenceArea y1={40} y2={60} strokeDasharray="3 3" stroke="rgba(229, 62, 62, 0.5)" strokeOpacity={0.7} fill="transparent" />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.1)"/>
                          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#666' }} />
                          <YAxis unit=" mmHg" domain={[30, 140]} tick={{ fontSize: 12, fill: '#666' }} />
                          <Tooltip cursor={{ stroke: '#0cf2a0', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                          <Legend wrapperStyle={{color: '#333', paddingTop: '20px'}} />
                          <Line type="monotone" dataKey="pp" name="脉压 (PP)" stroke={chartConfig.pp.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="map" name="平均动脉压 (MAP)" stroke={chartConfig.map.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              );
          case 'abi':
              return (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                           <ReferenceArea y1={1.0} y2={1.4} fill="rgba(56, 161, 105, 0.1)" stroke="transparent" />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.1)"/>
                          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#666' }} />
                          <YAxis domain={[0.8, 1.5]} tick={{ fontSize: 12, fill: '#666' }} />
                          <Tooltip cursor={{ stroke: '#0cf2a0', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="abi" name="踝臂指数 (ABI)" stroke={chartConfig.abi.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              );
          case 'cavi':
              return (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <ReferenceArea y1={0} y2={8.0} fill="rgba(56, 161, 105, 0.1)" stroke="transparent" />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.1)"/>
                          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#666' }} />
                          <YAxis domain={[7, 10]} tick={{ fontSize: 12, fill: '#666' }} />
                          <Tooltip cursor={{ stroke: '#0cf2a0', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="cavi" name="心踝血管指数 (CAVI)" stroke={chartConfig.cavi.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              );
          default:
              return null;
      }
  };

  const selectedCardInfo = chartCardsInfo.find(c => c.id === selectedCardId) || null;
  const corePressureCard = chartCardsInfo.find(c => c.id === 'core_pressure');
  const otherCards = chartCardsInfo.filter(c => c.id !== 'core_pressure');

  return (
    <div className="flex flex-col lg:flex-row gap-2 w-full h-full p-2 bg-black">
        <div className="w-full lg:w-7/10 flex flex-col gap-2">
            {corePressureCard && (
                <div 
                    key={corePressureCard.id} 
                    className={cn(
                        "flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 cursor-pointer",
                        "h-[320px]",
                        selectedCardId === corePressureCard.id
                            ? "shadow-2xl ring-2 ring-[#0cf2a0]" 
                            : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedCardId(corePressureCard.id)}
                >
                    <div className="mb-2 flex-shrink-0">
                        <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900">{corePressureCard.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{corePressureCard.description}</p>
                    </div>
                    <div className="flex-grow w-full">
                        {renderChart(corePressureCard.id)}
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {otherCards.map((card) => (
                  <div 
                    key={card.id} 
                    className={cn(
                        "flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 cursor-pointer",
                        "h-[320px]",
                        selectedCardId === card.id
                            ? "shadow-2xl ring-2 ring-[#0cf2a0]" 
                            : "hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <div className="mb-2 flex-shrink-0">
                      <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900">{card.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                    </div>
                    <div className="flex-grow w-full">
                      {renderChart(card.id)}
                    </div>
                  </div>
                ))}
            </div>
        </div>
        <div className="w-full lg:w-3/10 lg:pl-0">
            <DetailPanel info={selectedCardInfo} />
        </div>
    </div>
  );
}