// src/components/ui/HealthMetricChart.tsx

"use client"

import { useEffect, useState } from "react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

// --- 数据获取方式已更新 ---
// 此组件现在通过调用内部 API 路由 /api/health-data 来获取数据，
// 而不是直接连接到 Supabase。这是一种更安全、更推荐的模式。
//
// This component now fetches data by calling the internal API route /api/health-data
// instead of connecting directly to Supabase. This is a more secure and recommended pattern.

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

// 定义从 Supabase health_metrics 表获取的数据的类型
// Defines the type for data fetched from the Supabase health_metrics table
interface HealthMetric {
  id: number;
  user_email: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
  notes: string | null;
}

// 定义组件接收的 props 类型 (移除了 userEmail)
// Defines the props type for the component (userEmail has been removed)
interface HealthMetricChartProps {
  metricName: string;
  title: string;
  description: string;
  maxValue: number; // 用于计算径向条百分比的最大值 (The maximum value for calculating the radial bar percentage)
  unit: string; // 指标的单位 (The unit for the metric)
}

// 图表配置
// Chart configuration
const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

/**
 * HealthMetricChart 组件
 * 通过 API 路由获取并显示最新的单个健康指标。
 * * The HealthMetricChart component.
 * Fetches via an API route and displays the latest single health metric.
 */
export function HealthMetricChart({
  metricName,
  title,
  description,
  maxValue,
  unit,
}: HealthMetricChartProps) {
  // 使用 useState 管理指标数据、加载状态和错误状态
  // Use useState to manage metric data, loading state, and error state
  const [metricData, setMetricData] = useState<HealthMetric | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 使用 useEffect 在组件挂载时从 API 路由获取数据
  // Use useEffect to fetch data from the API route when the component mounts
  useEffect(() => {
    const fetchHealthMetric = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 调用您创建的 API 路由
        // Call the API route you created
        const response = await fetch('/api/health-data');

        if (!response.ok) {
          throw new Error(`API 请求失败，状态码: ${response.status}`);
        }

        const allMetrics: HealthMetric[] = await response.json();
        
        // 从返回的所有指标中，找到最新的一个匹配当前组件指标名称的记录
        // From all returned metrics, find the latest record that matches the current component's metric name
        const specificMetric = allMetrics
          .filter(m => m.metric_name === metricName)
          .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];


        if (specificMetric) {
          setMetricData(specificMetric);
        } else {
          setError(`未找到 '${metricName}' 指标的数据。`);
        }
      } catch (err: any) {
        console.error("Error fetching health metric from API:", err);
        setError(`无法加载指标数据: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthMetric();
  }, [metricName]); // 当 metricName 变化时重新获取数据 (Refetch data when metricName changes)

  // 渲染加载状态的UI
  // Render the UI for the loading state
  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[420px]">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="py-8">正在加载数据...</div>
      </Card>
    )
  }

  // 渲染错误状态的UI
  // Render the UI for the error state
  if (error || !metricData) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[420px]">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="py-8 text-destructive">{error || "未找到指标数据。"}</div>
      </Card>
    )
  }
  
  // 将获取到的数据格式化以适应图表
  // Format the fetched data to fit the chart
  const chartData = [
    {
      metric: metricName,
      value: metricData.metric_value,
      fill: "var(--color-value)",
    },
  ]
  
  // 计算径向条的结束角度。Recharts 逆时针绘制。
  // Calculate the end angle for the radial bar. Recharts draws counter-clockwise.
  const endAngle = 360 * (metricData.metric_value / maxValue);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90} // 从顶部开始 (Start from the top)
            endAngle={90 - endAngle} // 逆时针绘制 (Draw counter-clockwise)
            innerRadius={80}
            outerRadius={110}
            barSize={10}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {metricData.metric_value.toLocaleString()}
                          <tspan className="ml-1 text-lg font-normal text-muted-foreground">{unit}</tspan>
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {metricName}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          数据记录于: {new Date(metricData.recorded_at).toLocaleDateString()}
        </div>
        {metricData.notes && (
          <div className="text-muted-foreground leading-none">
            备注: {metricData.notes}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
