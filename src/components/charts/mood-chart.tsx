"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MoodChartProps {
    data: { month: string; mood: number }[]
}

export function MoodChart({ data }: MoodChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Humeur de Lecture</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis
                                dataKey="month"
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                domain={[0, 5]}
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
                            />
                            <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ fill: "#8b5cf6", r: 4 }}
                                name="Note moyenne"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
