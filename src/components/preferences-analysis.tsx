"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, BookMarked } from "lucide-react"

interface PreferencesAnalysisProps {
    topGenres: Array<{ name: string; count: number }>
    topAuthors: Array<{ name: string; count: number }>
}

export function PreferencesAnalysis({ topAuthors }: { topAuthors: Array<{ name: string; count: number }> }) {
    const maxAuthorCount = topAuthors[0]?.count || 1

    return (
        <div className="grid grid-cols-1">
            {/* Top Authors */}
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Auteurs Récurrents</h3>
                </div>
                {topAuthors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                ) : (
                    <div className="space-y-4">
                        {topAuthors.map((author, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{author.name}</span>
                                    <span className="text-sm text-muted-foreground">{author.count} livres</span>
                                </div>
                                <Progress value={(author.count / maxAuthorCount) * 100} className="h-2" />
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
