"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, TrendingUp, Calendar } from "lucide-react"

interface ReadingPredictionProps {
    prediction: {
        currentCount: number
        predictedTotal: number
        daysRemaining: number
        averagePerMonth: string
    }
}

export function ReadingPrediction({ prediction }: ReadingPredictionProps) {
    return (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Prédiction de Lecture</h3>
            </div>

            <div className="space-y-6">
                <div>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                        {prediction.predictedTotal} livres
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        À ce rythme, vous lirez environ <strong>{prediction.predictedTotal}</strong> livres cette année
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <TrendingUp className="h-3 w-3" />
                            <p className="text-xs">Actuellement</p>
                        </div>
                        <p className="text-2xl font-semibold">{prediction.currentCount}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Calendar className="h-3 w-3" />
                            <p className="text-xs">Moyenne/mois</p>
                        </div>
                        <p className="text-2xl font-semibold">{prediction.averagePerMonth}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Calendar className="h-3 w-3" />
                            <p className="text-xs">Jours restants</p>
                        </div>
                        <p className="text-2xl font-semibold">{prediction.daysRemaining}</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}
