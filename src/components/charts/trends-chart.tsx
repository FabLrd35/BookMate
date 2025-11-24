"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TrendsChartProps {
    data: { month: string; count: number }[]
}

export function TrendsChart({ data }: TrendsChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tendances</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis
                                dataKey="month"
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    color: "hsl(var(--foreground))",
                                }}
                                cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                name="Livres"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
