"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyPagesChartProps {
    data: { name: string; pages: number }[]
}

export function MonthlyPagesChart({ data }: MonthlyPagesChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pages Lues</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis
                                dataKey="name"
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
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
                                dataKey="pages"
                                fill="hsl(var(--chart-2))"
                                radius={[4, 4, 0, 0]}
                                name="Pages"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
