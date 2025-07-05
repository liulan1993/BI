"use client"

import React from 'react';
// 移除了 TooltipProps，因为我们将手动定义它以解决类型冲突
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// 手动定义自定义工具提示的属性类型
// 这可以避免因 recharts 版本差异导致的类型问题
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    stroke: string;
    dataKey: string;
  }>;
  label?: string | number;
}

// 模拟多年的季度健康数据
const healthData = [
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

// 定义图表各项指标的配置
const chartConfig = {
  pp: { label: "脉压 (PP)", color: "#E53E3E" },
  map: { label: "平均动脉压 (MAP)", color: "#3182CE" },
  abi: { label: "踝臂指数 (ABI)", color: "#38A169" },
  cavi: { label: "心踝血管指数 (CAVI)", color: "#DD6B20" },
  normalRange: { color: "rgba(56, 161, 105, 0.2)" },
  borderlineRange: { color: "rgba(237, 137, 54, 0.2)" },
  abnormalRange: { color: "rgba(229, 62, 62, 0.2)" },
} satisfies ChartConfig;

// 自定义图表提示框内容 - 使用手动定义的 Props 类型
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-white border rounded-lg shadow-lg dark:bg-zinc-800 dark:border-zinc-700">
        <p className="font-bold text-black dark:text-white">{`${label}`}</p>
        {payload.map((pld) => (
          <p key={pld.dataKey} style={{ color: pld.stroke }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 改善指南组件
const ImprovementGuide = () => (
  <div className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
    <hr className="my-8" />
    <h3 className="text-xl font-bold mb-6">改善指南</h3>
    <div className="mb-8 p-4 border rounded-lg">
        <h4 className="font-bold text-lg">【指标靶心】:脉压(PP)-数值过高(&gt;50-60 mmHg)</h4>
        <p><strong>【告警解读】:</strong> 你的大动脉正在失去弹性，变得像一根僵硬的铁管，而不是柔软的橡胶管。心脏每次泵血时，压力无法被有效缓冲，导致收缩压过高而舒张压相对偏低，形成了巨大的压力“浪涌”。这种浪涌会冲击你的大脑、心脏和肾脏的微小血管，是心脑血管事件的独立危险因素。</p>
    </div>
    <div className="mb-8 p-4 border rounded-lg">
        <h4 className="font-bold text-lg">【指标靶心】:平均动脉压(MAP)-数值持续过高(&gt;100 mmHg)</h4>
        <p><strong>【告警解读】:</strong>你的整个循环系统长期处于过高的压力之下。这不仅仅是血压计上的一个数字，而是你的心脏、大脑、肾脏等每一个重要器官的血管正在承受的、24小时不间断的过度负荷。这会加速器官的老化和衰竭。</p>
    </div>
    <div className="mb-8 p-4 border rounded-lg">
        <h4 className="font-bold text-lg">【指标靶心】:踝臂指数(ABI)-指数过低(&lt;0.9)</h4>
        <p><strong>【告警解读】:</strong>你的下肢血管正在“堵塞”。这个简单的比值通过比较脚踝和手臂的血压，直接反映了从心脏到腿部的动脉是否存在狭窄或闭塞（下肢动脉疾病，PAD）。ABI过低不仅意味着你走路可能会腿痛（间歇性跛行），更重要的是，它是一个<strong>全身性动脉粥样硬化</strong>的强烈信号，你的心脏和大脑的血管很可能也存在同样的问题。</p>
    </div>
    <div className="p-4 border rounded-lg">
        <h4 className="font-bold text-lg">【指标靶心】心踝血管指数(CAVI)-指数过高</h4>
        <p><strong>【告警解读】:</strong> 你的大动脉系统正在全面“硬化”。CAVI是一个评估从心脏到脚踝整个动脉系统“僵硬度”的指标，并且理论上受测量时血压的影响较小。高CAVI意味着你的血管失去了弹性，无法有效缓冲心脏泵血的压力波，这会反过来增加心脏的后负荷，并损害大脑和肾脏的微循环。</p>
    </div>
  </div>
);

export default function VascularHealthDashboard() {
  return (
    <div className="p-0 bg-transparent">
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardContent className="p-0">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">核心血压: 脉压 (PP) & 平均动脉压 (MAP)</h3>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <ReferenceArea y1={70} y2={100} fill={chartConfig.normalRange.color} stroke="transparent" label={{ value: "正常 MAP", position: "insideTopLeft", fill: "#2F855A", opacity: 0.8, fontSize: 12 }} />
                  <ReferenceArea y1={100} y2={140} fill={chartConfig.borderlineRange.color} stroke="transparent" label={{ value: "临界/高 MAP", position: "insideTopLeft", fill: "#C05621", opacity: 0.8, fontSize: 12 }} />
                  <ReferenceArea y1={40} y2={60} strokeDasharray="5 5" stroke="#C53030" strokeOpacity={0.7} fill="transparent" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2}/>
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#a0aec0' }} />
                  <YAxis unit=" mmHg" domain={[30, 140]} tick={{ fontSize: 12, fill: '#a0aec0' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{color: '#a0aec0'}} />
                  <Line type="monotone" dataKey="pp" name="脉压 (PP)" stroke={chartConfig.pp.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="map" name="平均动脉压 (MAP)" stroke={chartConfig.map.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-200">外周血管: 踝臂指数 (ABI)</h3>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                  <LineChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <ReferenceArea y1={1.0} y2={1.4} fill={chartConfig.normalRange.color} stroke="transparent" label={{ value: "正常", position: "insideTopLeft", fill: "#2F855A", opacity: 0.8, fontSize: 12 }} />
                    <ReferenceArea y1={0.9} y2={1.0} fill={chartConfig.borderlineRange.color} stroke="transparent" label={{ value: "临界", position: "insideTopLeft", fill: "#C05621", opacity: 0.8, fontSize: 12 }} />
                    <ReferenceArea y1={0} y2={0.9} fill={chartConfig.abnormalRange.color} stroke="transparent" label={{ value: "异常", position: "insideBottomLeft", fill: "#C53030", opacity: 0.8, fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2}/>
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#a0aec0' }} />
                    <YAxis domain={[0.8, 1.5]} tick={{ fontSize: 12, fill: '#a0aec0' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{color: '#a0aec0'}}/>
                    <Line type="monotone" dataKey="abi" name="踝臂指数 (ABI)" stroke={chartConfig.abi.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-200">动脉硬度: 心踝血管指数 (CAVI)</h3>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                  <LineChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <ReferenceArea y1={0} y2={8.0} fill={chartConfig.normalRange.color} stroke="transparent" label={{ value: "健康", position: "insideBottomLeft", fill: "#2F855A", opacity: 0.8, fontSize: 12 }} />
                    <ReferenceArea y1={8.0} y2={9.0} fill={chartConfig.borderlineRange.color} stroke="transparent" label={{ value: "临界", position: "insideTopLeft", fill: "#C05621", opacity: 0.8, fontSize: 12 }} />
                    <ReferenceArea y1={9.0} y2={12} fill={chartConfig.abnormalRange.color} stroke="transparent" label={{ value: "异常", position: "insideTopLeft", fill: "#C53030", opacity: 0.8, fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2}/>
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#a0aec0' }} />
                    <YAxis domain={[7, 10]} tick={{ fontSize: 12, fill: '#a0aec0' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{color: '#a0aec0'}}/>
                    <Line type="monotone" dataKey="cavi" name="心踝血管指数 (CAVI)" stroke={chartConfig.cavi.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
          <ImprovementGuide />
        </CardContent>
      </Card>
    </div>
  );
}
