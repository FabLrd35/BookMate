"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface YearComparisonChartProps {
    data: { year: number; booksRead: number; totalPages: number }[]
}

export function YearComparisonChart({ data }: YearComparisonChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Comparaison Annuelle</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                            <XAxis
                                dataKey="year"
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
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
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="booksRead"
                                fill="#3b82f6"
                                name="Livres"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="totalPages"
                                fill="#f59e0b"
                                name="Pages"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
