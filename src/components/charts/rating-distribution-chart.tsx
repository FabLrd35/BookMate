"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RatingDistributionChartProps {
    data: { name: string; value: number }[]
}

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribution des Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                                width={60}
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
                                dataKey="value"
                                fill="hsl(var(--primary))"
                                radius={[0, 4, 4, 0]}
                                name="Livres"
                                barSize={24}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
