"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrafficEntry } from "@/lib/types"

interface TrafficChartProps {
  data: TrafficEntry[]
  title?: string
}

export function TrafficChart({ data, title = "Traffic Overview" }: TrafficChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(220 10% 46%)", fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(220 10% 46%)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(220 13% 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="hsl(215 100% 50%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(215 100% 50%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
