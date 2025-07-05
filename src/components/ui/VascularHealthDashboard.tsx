"use client"

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// 为 Tooltip 的 payload item 定义一个明确的类型
type TooltipPayloadItem = {
    dataKey: string;
    name: string;
    value: string | number;
    color: string;
    stroke: string;
}

// 为 CustomTooltip 的 props 定义一个明确的接口
interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
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

// 自定义图表提示框内容
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
        <p className="font-bold text-white">{`${label}`}</p>
        {payload.map((pld: TooltipPayloadItem) => (
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
    <div className="h-full prose prose-stone dark:prose-invert max-w-none text-left p-6 border border-gray-200 rounded-lg bg-gray-50/50 overflow-y-auto">
      <h3 className="text-xl font-bold mb-6 text-center" style={{ color: '#08a169' }}>改善指南</h3>
      
      <div className="mb-8">
          <h4 className="font-bold text-lg text-gray-800">【指标靶心】:脉压(PP)-数值过高(&gt;50-60 mmHg)</h4>
          <p className="text-gray-600"><strong>【告警解读】:</strong> 你的大动脉正在失去弹性，变得像一根僵硬的铁管，而不是柔软的橡胶管。心脏每次泵血时，压力无法被有效缓冲，导致收缩压过高而舒张压相对偏低，形成了巨大的压力“浪涌”。这种浪涌会冲击你的大脑、心脏和肾脏的微小血管，是心脑血管事件的独立危险因素。</p>
      </div>
  
      <div className="mb-8">
          <h4 className="font-bold text-lg text-gray-800">【指标靶心】:平均动脉压(MAP)-数值持续过高(&gt;100 mmHg)</h4>
          <p className="text-gray-600"><strong>【告警解读】:</strong>你的整个循环系统长期处于过高的压力之下。这不仅仅是血压计上的一个数字，而是你的心脏、大脑、肾脏等每一个重要器官的血管正在承受的、24小时不间断的过度负荷。这会加速器官的老化和衰竭。</p>
      </div>
  
      <div className="mb-8">
          <h4 className="font-bold text-lg text-gray-800">【指标靶心】:踝臂指数(ABI)-指数过低(&lt;0.9)</h4>
          <p className="text-gray-600"><strong>【告警解读】:</strong>你的下肢血管正在“堵塞”。这个简单的比值通过比较脚踝和手臂的血压，直接反映了从心脏到腿部的动脉是否存在狭窄或闭塞（下肢动脉疾病，PAD）。ABI过低不仅意味着你走路可能会腿痛（间歇性跛行），更重要的是，它是一个<strong>全身性动脉粥样硬化</strong>的强烈信号，你的心脏和大脑的血管很可能也存在同样的问题。</p>
      </div>
  
      <div>
          <h4 className="font-bold text-lg text-gray-800">【指标靶心】心踝血管指数(CAVI)-指数过高</h4>
          <p className="text-gray-600"><strong>【告警解读】:</strong> 你的大动脉系统正在全面“硬化”。CAVI是一个评估从心脏到脚踝整个动脉系统“僵硬度”的指标，并且理论上受测量时血压的影响较小。高CAVI意味着你的血管失去了弹性，无法有效缓冲心脏泵血的压力波，这会反过来增加心脏的后负荷，并损害大脑和肾脏的微循环。</p>
      </div>
    </div>
  );

export default function VascularHealthDashboard() {
  return (
    <Card className="w-full h-full bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <CardContent className="p-0 h-full">
        {/* 修改：使用标准的10列网格系统，并确保在小屏幕上堆叠 */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 h-full">
            {/* 左侧：所有图表 - 在大屏幕上占据7/10宽度 */}
            <div className="lg:col-span-7 flex flex-col gap-8 min-w-0">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0cf2a0' }}>核心血压: 脉压 (PP) & 平均动脉压 (MAP)</h3>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                      <LineChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <ReferenceArea y1={70} y2={100} fill={chartConfig.normalRange.color} stroke="transparent" label={{ value: "正常 MAP", position: "insideTopLeft", fill: "#2F855A", opacity: 0.8, fontSize: 12 }} />
                        <ReferenceArea y1={100} y2={140} fill={chartConfig.borderlineRange.color} stroke="transparent" label={{ value: "临界/高 MAP", position: "insideTopLeft", fill: "#C05621", opacity: 0.8, fontSize: 12 }} />
                        <ReferenceArea y1={40} y2={60} strokeDasharray="5 5" stroke="#C53030" strokeOpacity={0.7} fill="transparent" />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2}/>
                        <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis unit=" mmHg" domain={[30, 140]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip cursor={{ stroke: '#0cf2a0', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Legend wrapperStyle={{color: '#374151'}} />
                        <Line type="monotone" dataKey="pp" name="脉压 (PP)" stroke={chartConfig.pp.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="map" name="平均动脉压 (MAP)" stroke={chartConfig.map.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#0cf2a0' }}>外周血管: 踝臂指数 (ABI)</h3>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer>
                        <LineChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <ReferenceArea y1={1.0} y2={1.4} fill={chartConfig.normalRange.color} stroke="transparent" label={{ value: "正常", position: "insideTopLeft", fill: "#2F855A", opacity: 0.8, fontSize: 12 }} />
                          <ReferenceArea y1={0.9} y2={1.0} fill={chartConfig.borderlineRange.color} stroke="transparent" label={{ value: "临界", position: "insideTopLeft", fill: "#C05621", opacity: 0.8, fontSize: 12 }} />
                          <ReferenceArea y1={0} y2={0.9} fill={chartConfig.abnormalRange.color} stroke="transparent" label={{ value: "异常", position: "insideBottomLeft", fill: "#C53030", opacity: 0.8, fontSize: 12 }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2}/>
                          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <YAxis domain={[0.8, 1.5]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <Tooltip cursor={{ stroke: '#0cf2a0', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                          <Legend wrapperStyle={{color: '#374151'}}/>
                          <Line type="monotone" dataKey="abi" name="踝臂指数 (ABI)" stroke={chartConfig.abi.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#0cf2a0' }}>动脉硬度: 心踝血管指数 (CAVI)</h3>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <ResponsiveContainer>
                        <LineChart data={healthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <ReferenceArea y1={0} y2={8.0} fill={chartConfig.normalRange.color} stroke="transparent" label={{ value: "健康", position: "insideBottomLeft", fill: "#2F855A", opacity: 0.8, fontSize: 12 }} />
                          <ReferenceArea y1={8.0} y2={9.0} fill={chartConfig.borderlineRange.color} stroke="transparent" label={{ value: "临界", position: "insideTopLeft", fill: "#C05621", opacity: 0.8, fontSize: 12 }} />
                          <ReferenceArea y1={9.0} y2={12} fill={chartConfig.abnormalRange.color} stroke="transparent" label={{ value: "异常", position: "insideTopLeft", fill: "#C53030", opacity: 0.8, fontSize: 12 }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2}/>
                          <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <YAxis domain={[7, 10]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <Tooltip cursor={{ stroke: '#0cf2a0', strokeWidth: 1, strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                          <Legend wrapperStyle={{color: '#374151'}}/>
                          <Line type="monotone" dataKey="cavi" name="心踝血管指数 (CAVI)" stroke={chartConfig.cavi.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
            </div>

            {/* 右侧：改善指南 - 在大屏幕上占据3/10宽度 */}
            <div className="lg:col-span-3 h-full min-w-0">
                <ImprovementGuide />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
