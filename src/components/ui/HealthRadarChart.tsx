// src/components/ui/HealthRadarChart.tsx

"use client"

import * as React from "react"
// 修正：从 recharts 中导入 PolarRadiusAxis
// FIX: Import PolarRadiusAxis from recharts
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

// 定义从 API 获取的数据的类型
// Defines the type for data fetched from the API
interface HealthMetric {
  id: number;
  user_email: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
  notes: string | null;
}

// 定义雷达图各项指标的名称和最大值，用于归一化数据
// Defines the name and maximum value for each metric on the radar chart for data normalization
const RADAR_METRICS_CONFIG = [
  { name: "身高", max: 200 }, // cm
  { name: "肩宽", max: 100 }, // cm
  { name: "体重", max: 150 }, // kg or jin, depending on your unit
  { name: "臂展", max: 220 }, // cm
  { name: "腰围", max: 150 }, // cm
];

// 定义图表配置
// Defines the chart configuration
const chartConfig = {
  value: {
    label: "当前值",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function HealthRadarChart() {
  const [chartData, setChartData] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchAndProcessData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/health-data')
        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.status}`)
        }
        const allMetrics: HealthMetric[] = await response.json()

        // 处理数据以适应雷达图格式
        // Process the data to fit the radar chart format
        const processedData = RADAR_METRICS_CONFIG.map(config => {
          // 找到每个指标最新的记录
          // Find the latest record for each metric
          const latestRecord = allMetrics
            .filter(m => m.metric_name === config.name)
            .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];
          
          return {
            metric: config.name,
            value: latestRecord ? latestRecord.metric_value : 0,
            fullMark: config.max,
          }
        })

        if (processedData.some(d => d.value > 0)) {
          setChartData(processedData)
        } else {
          setError("未找到任何相关的健康指标数据。")
        }
      } catch (err: any) {
        setError(`加载数据失败: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndProcessData()
  }, [])

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>综合身体数据雷达图</CardTitle>
          <CardDescription>正在加载数据...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p>Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>综合身体数据雷达图</CardTitle>
          <CardDescription>数据加载出错</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="items-center">
        <CardTitle>综合身体数据雷达图</CardTitle>
        <CardDescription>
          展示您最新的身体综合数据。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[350px]"
        >
          <RadarChart data={chartData}>
            {/* 修正：移除 <ChartConfig />，因为它是一个类型而不是组件 */}
            {/* FIX: Remove <ChartConfig /> as it is a type, not a component */}
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} />
            <Radar
              name="Metrics"
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
