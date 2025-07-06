"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// 定义获取到的数据类型
interface HealthMetric {
  id: number;
  user_email: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
  notes: string | null;
}

// 定义一个图表组件
const HeartRateChart = ({ data }: { data: HealthMetric[] }) => {
  const heartRateData = data
    .filter(item => item.metric_name === '心率')
    .map(item => ({
      ...item,
      // 格式化日期以便在图表中显示
      formatted_date: new Date(item.recorded_at).toLocaleDateString(),
    }));

  return (
    <div className="bg-[#18181b] p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">心率变化趋势</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={heartRateData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formatted_date" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
          <Legend />
          <Line type="monotone" dataKey="metric_value" name="心率" stroke="#0CF2A0" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 看板页面主组件
export default function DashboardPage() {
  const [data, setData] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/health-data');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '获取数据失败');
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // 空依赖数组确保只在组件挂载时运行一次

  if (loading) {
    return <div className="text-center text-white p-10">正在加载您的健康数据...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">错误: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-300 p-4 sm:p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">您的健康看板</h1>
        <p className="text-gray-400 mt-2">以下是您最近的健康指标概览。</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <HeartRateChart data={data} />
        {/* 您可以在这里添加更多图表组件，例如体重、血压等 */}
        <div className="bg-[#18181b] p-6 rounded-lg shadow-lg">
           <h3 className="text-xl font-bold text-white mb-4">其他指标</h3>
           <p>此处可以放置更多图表...</p>
        </div>
      </main>
    </div>
  );
}
