"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsChartsProps {
    monthlyActivity: { name: string; count: number }[]
    genreDistribution: { name: string; value: number }[]
    ratingDistribution: { name: string; value: number }[]
    monthlyPages?: { name: string; pages: number }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function StatsCharts({
    monthlyActivity,
    genreDistribution,
    ratingDistribution,
    monthlyPages,
}: StatsChartsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Activity */}
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Activité de lecture mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyActivity}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    name="Livres lus"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Pages Read */}
            {monthlyPages && (
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Pages lues par mois</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyPages}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                                        dataKey="pages"
                                        fill="hsl(var(--chart-2))"
                                        radius={[4, 4, 0, 0]}
                                        name="Pages lues"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Genre Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Genres préférés</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genreDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {genreDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--background))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribution des notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingDistribution} layout="vertical">
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
                                    name="Nombre de livres"
                                    barSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
