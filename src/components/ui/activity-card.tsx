// src/components/ui/activity-card.tsx
"use client";

import React, { FC, HTMLAttributes, useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { Activity, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AgCharts } from "ag-charts-react";
import { AgCartesianChartOptions, AgNumberAxisOptions } from "ag-charts-community";

// --- 工具函数 ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 ---
interface Metric {
  label: string;
  value: string;
  trend: number;
  unit?: "岁" | "cm" | "kg" | "mmHg" | "次/分" | "BMI" | "";
}

interface HistoricalDataPoint {
  month: string;
  value: number;
}

// --- 数据源 ---
const INITIAL_METRICS: Metric[] = [
  { label: "年龄", value: "32", trend: 100, unit: "岁" },
  { label: "身高", value: "175", trend: 100, unit: "cm" },
  { label: "体重", value: "70.1", trend: 100, unit: "kg" },
  { label: "体重指数", value: "22.9", trend: 100, unit: "BMI" },
  { label: "收缩压", value: "120", trend: 100, unit: "mmHg" },
  { label: "舒张压", value: "80", trend: 100, unit: "mmHg" },
  { label: "心率", value: "72", trend: 100, unit: "次/分" },
  { label: "视力(左)", value: "4.9", trend: 100, unit: "" },
  { label: "视力(右)", value: "5.0", trend: 100, unit: "" },
];

const HISTORICAL_DATA: Record<string, HistoricalDataPoint[]> = {
    '身高': [
        { month: '一月', value: 175 }, { month: '二月', value: 175 }, { month: '三月', value: 175 },
        { month: '四月', value: 175 }, { month: '五月', value: 175 }, { month: '六月', value: 175 },
        { month: '七月', value: 175 }, { month: '八月', value: 175 }, { month: '九月', value: 175 },
        { month: '十月', value: 175 }, { month: '十一月', value: 175 }, { month: '十二月', value: 175 },
    ],
    '体重': [
        { month: '一月', value: 72.5 }, { month: '二月', value: 72.1 }, { month: '三月', value: 71.5 },
        { month: '四月', value: 71.0 }, { month: '五月', value: 70.8 }, { month: '六月', value: 70.5 },
        { month: '七月', value: 70.6 }, { month: '八月', value: 70.4 }, { month: '九月', value: 70.2 },
        { month: '十月', value: 70.5 }, { month: '十一月', value: 70.3 }, { month: '十二月', value: 70.1 },
    ],
    '体重指数': [
        { month: '一月', value: 23.7 }, { month: '二月', value: 23.5 }, { month: '三月', value: 23.3 },
        { month: '四月', value: 23.2 }, { month: '五月', value: 23.1 }, { month: '六月', value: 23.0 },
        { month: '七月', value: 23.0 }, { month: '八月', value: 23.0 }, { month: '九月', value: 22.9 },
        { month: '十月', value: 23.0 }, { month: '十一月', value: 22.9 }, { month: '十二月', value: 22.9 },
    ],
    '收缩压': [
        { month: '一月', value: 125 }, { month: '二月', value: 122 }, { month: '三月', value: 120 },
        { month: '四月', value: 121 }, { month: '五月', value: 119 }, { month: '六月', value: 120 },
        { month: '七月', value: 122 }, { month: '八月', value: 118 }, { month: '九月', value: 119 },
        { month: '十月', value: 120 }, { month: '十一月', value: 121 }, { month: '十二月', value: 120 },
    ],
    '舒张压': [
        { month: '一月', value: 82 }, { month: '二月', value: 81 }, { month: '三月', value: 79 },
        { month: '四月', value: 80 }, { month: '五月', value: 78 }, { month: '六月', value: 80 },
        { month: '七月', value: 81 }, { month: '八月', value: 79 }, { month: '九月', value: 78 },
        { month: '十月', value: 80 }, { month: '十一月', value: 81 }, { month: '十二月', value: 80 },
    ],
    '心率': [
        { month: '一月', value: 75 }, { month: '二月', value: 74 }, { month: '三月', value: 72 },
        { month: '四月', value: 70 }, { month: '五月', value: 71 }, { month: '六月', value: 72 },
        { month: '七月', value: 73 }, { month: '八月', value: 71 }, { month: '九月', value: 72 },
        { month: '十月', value: 74 }, { month: '十一月', value: 73 }, { month: '十二月', value: 72 },
    ],
    '视力(左)': [
        { month: '一月', value: 4.9 }, { month: '二月', value: 4.9 }, { month: '三月', value: 4.8 },
        { month: '四月', value: 4.9 }, { month: '五月', value: 4.9 }, { month: '六月', value: 4.8 },
        { month: '七月', value: 4.9 }, { month: '八月', value: 4.8 }, { month: '九月', value: 4.8 },
        { month: '十月', value: 4.9 }, { month: '十一月', value: 4.9 }, { month: '十二月', value: 4.9 },
    ],
    '视力(右)': [
        { month: '一月', value: 5.0 }, { month: '二月', value: 5.0 }, { month: '三月', value: 5.0 },
        { month: '四月', value: 4.9 }, { month: '五月', value: 5.0 }, { month: '六月', value: 5.0 },
        { month: '七月', value: 5.0 }, { month: '八月', value: 4.9 }, { month: '九月', value: 5.0 },
        { month: '十月', value: 5.0 }, { month: '十一月', value: 5.0 }, { month: '十二月', value: 5.0 },
    ],
    '年龄': [],
};

const HEALTHY_RANGES: Record<string, { min: number; max: number }> = {
  '体重指数': { min: 18.5, max: 24.9 },
  '收缩压': { min: 90, max: 120 },
  '舒张压': { min: 60, max: 80 },
  '心率': { min: 60, max: 100 },
};

const FIXED_Y_AXIS_RANGES: Record<string, { min: number; max: number }> = {
  '身高': { min: 150, max: 190 },
  '体重': { min: 40, max: 100 },
  '体重指数': { min: 15, max: 30 },
  '收缩压': { min: 90, max: 150 },
  '舒张压': { min: 50, max: 110 },
  '心率': { min: 50, max: 150 },
  '视力(左)': { min: 4.0, max: 5.3 },
  '视力(右)': { min: 4.0, max: 5.3 },
};

export interface ActivityCardProps extends HTMLAttributes<HTMLDivElement> {
  category?: string;
  title?: string;
}

const METRIC_COLORS: { [key: string]: string } = {
  '年龄': '#3498DB', '身高': '#9B59B6', '体重': '#E67E22',
  '体重指数': '#1ABC9C', '收缩压': '#F1C40F', '舒张压': '#E74C3C',
  '心率': '#2ECC71', '视力(左)': '#8E44AD', '视力(右)': '#4373a3ff',
};

const HistoricalDataChart: FC<{ metric: Metric }> = ({ metric }) => {
  const chartOptions = useMemo((): AgCartesianChartOptions => {
    const data = HISTORICAL_DATA[metric.label];
    if (!data || data.length === 0) return {};
    
    const healthyRange = HEALTHY_RANGES[metric.label];
    const fixedAxisRange = FIXED_Y_AXIS_RANGES[metric.label];

    // 修复 #1: 使用 as AgNumberAxisOptions 进行类型断言，解决 plotBands 错误
    const yAxisOptions = {
        type: 'number',
        position: 'left',
        title: { text: `数值 (${metric.unit || '单位'})`.trim() },
        label: {
            color: 'rgb(161, 161, 170)',
        },
        min: fixedAxisRange?.min,
        max: fixedAxisRange?.max,
        plotBands: healthyRange ? [
            {
                range: [healthyRange.min, healthyRange.max],
                fill: 'rgba(46, 204, 113, 0.3)',
                label: {
                    text: '健康范围',
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: 4,
                }
            },
        ] : [],
    } as AgNumberAxisOptions;

    return {
      data: data,
      title: { text: `${metric.label} - 历史趋势` },
      background: { fill: 'transparent' },
      theme: 'ag-default-dark',
      legend: {
        enabled: false,
      },
      axes: [
        {
          type: 'category',
          position: 'bottom',
          title: { text: '月份' },
          label: {
            color: 'rgb(161, 161, 170)',
          },
        },
        yAxisOptions,
      ],
      series: [{
        type: 'line',
        xKey: 'month',
        yKey: 'value',
        yName: metric.label,
        stroke: METRIC_COLORS[metric.label] || '#888888',
        marker: {
            fill: METRIC_COLORS[metric.label] || '#888888',
        },
        label: {
            enabled: true,
            fontWeight: 'bold',
            color: 'white',
        },
      }],
    };
  }, [metric]);

  const hasData = HISTORICAL_DATA[metric.label] && HISTORICAL_DATA[metric.label].length > 0;

  return (
    <div className="w-full h-full">
       {hasData ? (
           <AgCharts options={chartOptions} />
       ) : (
         <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">暂无 "{metric.label}" 的历史数据</p>
         </div>
       )}
    </div>
  );
};

export const ActivityCard: FC<ActivityCardProps> = ({
  category = "个人数据",
  title = "我的基础指标",
  className,
  ...props
}) => {
  const [metrics] = useState<Metric[]>(INITIAL_METRICS);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  
  const [chartAreaHeight, setChartAreaHeight] = useState(0);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chartableMetrics = INITIAL_METRICS.filter(m => m.label !== '年龄');
    const randomInitialMetric = chartableMetrics[Math.floor(Math.random() * chartableMetrics.length)];
    setSelectedMetric(randomInitialMetric);
  }, []);

  useLayoutEffect(() => {
    const leftColumn = leftColumnRef.current;
    if (!leftColumn) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setChartAreaHeight(height);
        }
      }
    });

    observer.observe(leftColumn);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-3xl p-8 w-full max-w-[1600px]",
        "bg-white dark:bg-zinc-950",
        "border border-zinc-200 dark:border-zinc-800",
        "transition-all duration-300 shadow-sm",
        "flex flex-col md:flex-row gap-8",
        className
      )}
      {...props}
    >
      <div ref={leftColumnRef} className="flex-shrink-0 w-full md:w-[360px]">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                    <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{category}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-8">
          {metrics.map((metric) => (
            <button key={metric.label} onClick={() => setSelectedMetric(metric)} className={cn("relative flex flex-col items-center p-2 rounded-lg transition-colors", selectedMetric?.label === metric.label ? "bg-zinc-100/10" : "hover:bg-zinc-100/5")}>
              <div className="relative w-24 h-24">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="stroke-current text-zinc-200 dark:text-zinc-800" strokeWidth="10" fill="transparent" />
                  <circle cx="50" cy="50" r="45" className="stroke-current transition-all duration-500" strokeWidth="10" fill="transparent" strokeDasharray="282.74" strokeDashoffset={0} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ color: METRIC_COLORS[metric.label] || '#888888' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">{metric.value}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{metric.unit}</span>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-center text-zinc-700 dark:text-zinc-300">{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block w-px bg-zinc-200 dark:bg-zinc-800"></div>
      
      {/* 修复 #2: 条件渲染，确保在有确切高度之前不渲染图表 */}
      <div className="flex-1 min-w-0" style={{ height: chartAreaHeight > 0 ? `${chartAreaHeight}px` : 'auto' }}>
        {chartAreaHeight > 0 && selectedMetric ? (
          <HistoricalDataChart metric={selectedMetric} />
        ) : (
          <div className="flex h-full w-full items-center justify-center min-h-[450px]">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        )}
      </div>
    </div>
  );
};