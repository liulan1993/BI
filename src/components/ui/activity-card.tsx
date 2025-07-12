// src/components/ui/activity-card.tsx
"use client";

import { FC, HTMLAttributes, useState } from "react";
import { Activity, BarChart } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- 工具函数 ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 内部类型定义 ---
interface Metric {
  label: string;
  value: string;
  trend: number;
  unit?: "岁" | "cm" | "kg" | "mmHg" | "次/分" | "BMI" | "";
}

// --- 数据源 ---
const INITIAL_METRICS: Metric[] = [
  { label: "年龄", value: "32", trend: 100, unit: "岁" },
  { label: "身高", value: "175", trend: 100, unit: "cm" },
  { label: "体重", value: "70.5", trend: 100, unit: "kg" },
  { label: "体重指数", value: "22.9", trend: 100, unit: "BMI" },
  { label: "收缩压", value: "120", trend: 100, unit: "mmHg" },
  { label: "舒张压", value: "80", trend: 100, unit: "mmHg" },
  { label: "心率", value: "72", trend: 100, unit: "次/分" },
  { label: "视力(左)", value: "4.9", trend: 100, unit: "" },
  { label: "视力(右)", value: "5.0", trend: 100, unit: "" },

];

// --- Props 接口定义 ---
export interface ActivityCardProps extends HTMLAttributes<HTMLDivElement> {
  category?: string;
  title?: string;
}

// --- 核心UI组件 ---
const METRIC_COLORS: { [key: string]: string } = {
  '年龄': '#3498DB',
  '身高': '#9B59B6',
  '体重': '#E67E22',
  '体重指数': '#1ABC9C',
  '收缩压': '#F1C40F',
  '舒张压': '#E74C3C',
  '心率': '#2ECC71',
  '视力(左)': '#8E44AD',
  '视力(右)': '#4373a3ff',
};

export const ActivityCard: FC<ActivityCardProps> = ({
  category = "个人数据",
  title = "我的基础指标",
  className,
  ...props
}) => {
  // --- 状态管理 (已移入组件内部) ---
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);

  return (
    <div
      className={cn(
        "relative h-full rounded-3xl p-8", // 增加内边距
        "bg-white dark:bg-zinc-950",
        "border border-zinc-200 dark:border-zinc-800",
        "transition-all duration-300 shadow-sm",
        "flex flex-col md:flex-row gap-8", // 在中等屏幕及以上使用 flex 布局
        className
      )}
      {...props}
    >
      {/* 左侧图表区域 */}
      <div className="flex-shrink-0 w-full md:w-[360px]">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {category}
            </p>
          </div>
        </div>

        {/* 指标环 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="relative flex flex-col items-center">
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
            </div>
          ))}
        </div>
      </div>

      {/* 分隔线 */}
      <div className="hidden md:block w-px bg-zinc-200 dark:bg-zinc-800"></div>
      <div className="block md:hidden h-px bg-zinc-200 dark:bg-zinc-800"></div>

      {/* 右侧文字区域 */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
            <BarChart className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              健康摘要分析
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              基于当前数据的综合评估
            </p>
          </div>
        </div>
        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            根据您提供的最新数据，您的各项核心健康指标均处于理想范围。
          </p>
          <p>
            您的 <strong className="text-zinc-800 dark:text-zinc-200">体重指数 (BMI)</strong> 为 <strong className="text-emerald-500">{metrics.find(m => m.label === '体重指数')?.value}</strong>，这是一个非常健康的信号。这表明您的体重与身高比例协调，是维持长期健康的重要基础。
          </p>
          <p>
            同时，您的 <strong className="text-zinc-800 dark:text-zinc-200">血压水平</strong> ({metrics.find(m => m.label === '收缩压')?.value}/{metrics.find(m => m.label === '舒张压')?.value} mmHg) 非常标准，这意味着您的心血管系统目前状况良好，患相关疾病的风险较低。
          </p>
          <p className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <strong className="text-zinc-800 dark:text-zinc-200">建议：</strong> 请继续保持当前均衡的饮食习惯和规律的体育锻炼，以维持这些优良的健康指标。
          </p>
        </div>
      </div>
    </div>
  );
};
