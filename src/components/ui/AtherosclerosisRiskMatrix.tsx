"use client";

import React, { useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

// Helper function for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- Type Definitions ---

type ChartData = {
  year: string;
  AIP: number;
  "Non-HDL-C": number;
  RC: number;
  "ApoB/ApoA1": number;
  "Non-HDL-C/ApoB": number;
  "LDL-C/ApoB": number;
  "VLDL-C": number;
  "Lp-PLA2": number;
};

type MetricConfig = {
  key: keyof Omit<ChartData, 'year'>;
  name: string;
  unit: string;
  range: string;
  color: string;
  healthyRange: { y1?: number; y2?: number } | null;
  description: string;
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        name: string;
        value: string | number;
        payload: any;
    }[];
    label?: string | number;
}

interface MetricDetailPanelProps {
    metric: MetricConfig | null;
}

// --- Component Data ---

const atherosclerosisChartData: ChartData[] = [
  { year: "2016", AIP: 0.10, "Non-HDL-C": 128, RC: 29, "ApoB/ApoA1": 0.85, "Non-HDL-C/ApoB": 1.45, "LDL-C/ApoB": 1.25, "VLDL-C": 28, "Lp-PLA2": 190 },
  { year: "2017", AIP: 0.12, "Non-HDL-C": 135, RC: 32, "ApoB/ApoA1": 0.91, "Non-HDL-C/ApoB": 1.42, "LDL-C/ApoB": 1.21, "VLDL-C": 31, "Lp-PLA2": 205 },
  { year: "2018", AIP: 0.09, "Non-HDL-C": 125, RC: 28, "ApoB/ApoA1": 0.82, "Non-HDL-C/ApoB": 1.48, "LDL-C/ApoB": 1.29, "VLDL-C": 27, "Lp-PLA2": 188 },
  { year: "2019", AIP: 0.15, "Non-HDL-C": 142, RC: 35, "ApoB/ApoA1": 0.95, "Non-HDL-C/ApoB": 1.40, "LDL-C/ApoB": 1.18, "VLDL-C": 34, "Lp-PLA2": 215 },
  { year: "2020", AIP: 0.18, "Non-HDL-C": 150, RC: 38, "ApoB/ApoA1": 0.98, "Non-HDL-C/ApoB": 1.38, "LDL-C/ApoB": 1.15, "VLDL-C": 37, "Lp-PLA2": 228 },
  { year: "2021", AIP: 0.22, "Non-HDL-C": 160, RC: 40, "ApoB/ApoA1": 1.05, "Non-HDL-C/ApoB": 1.35, "LDL-C/ApoB": 1.12, "VLDL-C": 41, "Lp-PLA2": 240 },
  { year: "2022", AIP: 0.20, "Non-HDL-C": 155, RC: 39, "ApoB/ApoA1": 1.01, "Non-HDL-C/ApoB": 1.36, "LDL-C/ApoB": 1.14, "VLDL-C": 39, "Lp-PLA2": 235 },
  { year: "2023", AIP: 0.17, "Non-HDL-C": 148, RC: 37, "ApoB/ApoA1": 0.97, "Non-HDL-C/ApoB": 1.39, "LDL-C/ApoB": 1.17, "VLDL-C": 36, "Lp-PLA2": 225 },
  { year: "2024", AIP: 0.14, "Non-HDL-C": 140, RC: 34, "ApoB/ApoA1": 0.93, "Non-HDL-C/ApoB": 1.41, "LDL-C/ApoB": 1.20, "VLDL-C": 33, "Lp-PLA2": 218 },
  { year: "2025", AIP: 0.16, "Non-HDL-C": 145, RC: 36, "ApoB/ApoA1": 0.96, "Non-HDL-C/ApoB": 1.40, "LDL-C/ApoB": 1.16, "VLDL-C": 35, "Lp-PLA2": 222 },
];

const atherosclerosisMetricsConfig: MetricConfig[] = [
  { key: "AIP", name: "血浆动脉粥样硬化指数 (AIP)", unit: "无", range: "< 0.11", color: "hsl(221.2 83.2% 53.3%)", healthyRange: { y2: 0.11 }, description: "AIP是通过计算甘油三酯(TG)与高密度脂蛋白胆固醇(HDL-C)的摩尔浓度对数比值得出，是评估动脉粥样硬化风险的强力指标，尤其能反映小而密低密度脂蛋白(sdLDL)的水平。0.11 - 0.21为中等风险，> 0.21为高风险。趋势越低越好。" },
  { key: "Non-HDL-C", name: "非高密度脂蛋白胆固醇 (Non-HDL-C)", unit: "mg/dL", range: "< 130 mg/dL", color: "hsl(142.1 76.2% 36.3%)", healthyRange: { y2: 130 }, description: "Non-HDL-C代表了所有携带载脂蛋白B (ApoB)的致动脉粥样硬化脂蛋白的总和，计算方法为总胆固醇(TC)减去高密度脂蛋白胆固醇(HDL-C)。对于高风险人群，目标值会更低。趋势越低越好。" },
  { key: "RC", name: "残余胆固醇 (RC)", unit: "mg/dL", range: "< 30 mg/dL", color: "hsl(346.8 77.2% 49.8%)", healthyRange: { y2: 30 }, description: "残余胆固醇指富含甘油三酯的脂蛋白（如VLDL和IDL）中所含的胆固醇，被认为是导致动脉粥样硬化和心血管事件的独立风险因素。趋势越低越好。" },
  { key: "ApoB/ApoA1", name: "载脂蛋白B/载脂蛋白A1比值", unit: "无", range: "男性 < 0.9, 女性 < 0.8", color: "hsl(24.6 95% 53.1%)", healthyRange: { y2: 0.8 }, description: "该比值反映了致动脉粥样硬化颗粒(ApoB)与抗动脉粥样硬化颗粒(ApoA1)之间的平衡。相较于单独的血脂指标，它被认为是预测心血管风险更准确的指标之一。趋势越低越好。" },
  { key: "Non-HDL-C/ApoB", name: "非高密度脂蛋白胆固醇/载脂蛋白B比值", unit: "无", range: "无统一标准", color: "hsl(262.1 83.3% 57.8%)", healthyRange: null, description: "这个比值理论上可以反映每个致动脉粥样硬化颗粒(ApoB)平均携带的胆固醇量。比值较高可能意味着胆固醇超载的脂蛋白颗粒较多。临床应用和标准化范围仍在探索中。" },
  { key: "LDL-C/ApoB", name: "低密度脂蛋白胆固醇/载脂蛋白B比值", unit: "无", range: "> 1.2", color: "hsl(170, 70%, 40%)", healthyRange: { y1: 1.2 }, description: "这个比值有助于评估LDL颗粒的大小。比值较低（如 < 1.2）通常与小而密低密度脂蛋白(sdLDL)占优势相关，而sdLDL的致动脉粥样硬化性更强。趋势越高越好。" },
  { key: "VLDL-C", name: "极低密度脂蛋白胆固醇 (VLDL-C)", unit: "mg/dL", range: "< 30 mg/dL", color: "hsl(330, 80%, 60%)", healthyRange: { y2: 30 }, description: "VLDL-C通常不直接测量，而是通过甘油三酯水平估算（VLDL-C ≈ TG/5）。它是残余胆固醇的主要组成部分，高水平与动脉粥样硬化风险增加相关。趋势越低越好。" },
  { key: "Lp-PLA2", name: "脂蛋白相关磷脂酶A2 (Lp-PLA2)", unit: "ng/mL", range: "< 200 ng/mL (质量)", color: "hsl(215, 25%, 27%)", healthyRange: { y2: 200 }, description: "Lp-PLA2是一种与血管炎症和不稳定斑块形成相关的酶。其水平升高是心肌梗死和中风的独立风险标志物，反映了血管壁的炎症状态而非血脂水平。趋势越低越好。" },
];

const CustomTooltipContent = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="rounded-lg border bg-white p-2.5 shadow-lg"><div className="grid grid-cols-1 gap-1"><div className="flex flex-col space-y-1"><span className="text-sm font-bold text-gray-800">{data.name}</span><span className="font-medium text-gray-900">{data.value}</span><span className="text-xs text-gray-500">年份: {label}</span></div></div></div>
        );
    }
    return null;
};

const MetricDetailPanel = ({ metric }: MetricDetailPanelProps) => {
    if (!metric) {
        return <div className="p-4 rounded-lg border border-dashed h-full flex items-center justify-center text-gray-500">点击左侧图表查看详细信息</div>;
    }
    return (
        <div className="p-6 rounded-lg border h-full bg-white shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{metric.name}</h3>
            <div className="space-y-5 text-gray-700">
                <div>
                    <p className="font-semibold text-gray-800">健康范围:</p>
                    <p className="text-base mt-1">{metric.range}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-800">单位:</p>
                    <p className="text-base mt-1">{metric.unit}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-800">说明:</p>
                    <p className="text-base leading-relaxed mt-1">{metric.description}</p>
                </div>
            </div>
        </div>
    );
};

export function AtherosclerosisRiskMatrix() {
  const [selectedMetric, setSelectedMetric] = useState<MetricConfig>(atherosclerosisMetricsConfig[0]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full p-2">
        <div className="w-full lg:w-7/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {atherosclerosisMetricsConfig.map((metric) => (
              <div 
                key={metric.key} 
                className={cn(
                    "flex flex-col rounded-lg border bg-white p-4 transition-all duration-300 cursor-pointer",
                    selectedMetric && selectedMetric.key === metric.key 
                        ? "shadow-xl ring-2 ring-blue-500" 
                        : "hover:shadow-lg"
                )}
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="mb-4">
                  <h3 className="text-base font-semibold leading-none tracking-tight text-gray-800">{metric.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{`健康范围: ${metric.range}`}</p>
                </div>
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={atherosclerosisChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickCount={5} fontSize={12} stroke="#6b7280" />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} domain={['auto', 'auto']} fontSize={12} stroke="#6b7280" />
                      {metric.healthyRange && <ReferenceArea y1={metric.healthyRange.y1} y2={metric.healthyRange.y2} fill="hsl(142.1 76.2% 36.3%)" fillOpacity={0.1} strokeOpacity={0} ifOverflow="visible" />}
                      <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: "3 3" }} />
                      <Line dataKey={metric.key} name={metric.name} type="monotone" stroke={metric.color} strokeWidth={2} dot={{ r: 4, fill: metric.color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-3/10 lg:pl-4">
            <MetricDetailPanel metric={selectedMetric} />
        </div>
    </div>
  );
}

export default AtherosclerosisRiskMatrix;
