"use client"

import { Card } from "@/components/ui/card"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

interface AdvancedAnalyticsChartsProps {
    moodData: Array<{ month: string; mood: number }>
    trendsData: Array<{ month: string; count: number }>
    yearComparisonData: Array<{ year: number; booksRead: number; totalPages: number }>
}

export function AdvancedAnalyticsCharts({
    moodData,
    trendsData,
    yearComparisonData,
}: AdvancedAnalyticsChartsProps) {
    return (
        <div className="space-y-6">
            {/* Reading Mood Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Humeur de Lecture</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Évolution de vos notes moyennes au fil du temps
                </p>
                {moodData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Aucune donnée disponible. Ajoutez des notes à vos livres!
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="month"
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis
                                domain={[0, 5]}
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="mood"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ fill: '#8b5cf6', r: 4 }}
                                name="Note moyenne"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* Reading Trends Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">📅 Tendances de Lecture</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Mois où vous lisez le plus (toutes années confondues)
                </p>
                {trendsData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Aucune donnée disponible
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={trendsData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="month"
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#10b981"
                                radius={[8, 8, 0, 0]}
                                name="Livres lus"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* Year Over Year Comparison */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">📈 Comparaison Année par Année</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Évolution de votre lecture au fil des années
                </p>
                {yearComparisonData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        Aucune donnée disponible
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={yearComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="year"
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis
                                yAxisId="left"
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="booksRead"
                                fill="#3b82f6"
                                name="Livres lus"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="totalPages"
                                fill="#f59e0b"
                                name="Pages lues"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </div>
    )
}
