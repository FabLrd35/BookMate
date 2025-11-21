import {
    getDetailedStats,
    getPagesReadStats,
    getReadingMoodAnalysis,
    getPreferencesAnalysis,
    getReadingTrends,
    getYearOverYearComparison,
    getReadingPrediction,
} from "@/app/actions/statistics"
import { StatsCharts } from "@/components/stats-charts"
import { PreferencesAnalysis } from "@/components/preferences-analysis"
import { ReadingPrediction } from "@/components/reading-prediction"
import { AdvancedAnalyticsCharts } from "@/components/advanced-analytics-charts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Sparkles } from "lucide-react"

export default async function StatisticsPage() {
    const [
        stats,
        pagesStats,
        moodData,
        preferences,
        trends,
        yearComparison,
        prediction,
    ] = await Promise.all([
        getDetailedStats(),
        getPagesReadStats(),
        getReadingMoodAnalysis(),
        getPreferencesAnalysis(),
        getReadingTrends(),
        getYearOverYearComparison(),
        getReadingPrediction(),
    ])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Statistiques</h1>
                <p className="text-muted-foreground mt-2">
                    Analysez vos habitudes de lecture et vos préférences.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Total livres lus</span>
                        <span className="text-2xl font-bold">{stats.totalRead}</span>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Pages lues cette année</span>
                        <span className="text-2xl font-bold">{pagesStats.totalPagesThisYear.toLocaleString('fr-FR')}</span>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Pages lues au total</span>
                        <span className="text-2xl font-bold">{pagesStats.totalPagesAllTime.toLocaleString('fr-FR')}</span>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <span className="text-sm font-medium text-muted-foreground">Moyenne pages/livre</span>
                        <span className="text-2xl font-bold">{pagesStats.averagePagesPerBook.toLocaleString('fr-FR')}</span>
                    </div>
                </div>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Analyses avancées
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <StatsCharts
                        monthlyActivity={stats.monthlyActivity}
                        genreDistribution={stats.genreDistribution}
                        ratingDistribution={stats.ratingDistribution}
                        monthlyPages={pagesStats.monthlyPages}
                    />
                </TabsContent>

                <TabsContent value="advanced" className="mt-6 space-y-6">
                    {/* Prediction */}
                    <ReadingPrediction prediction={prediction} />

                    {/* Preferences */}
                    <PreferencesAnalysis
                        topGenres={preferences.topGenres}
                        topAuthors={preferences.topAuthors}
                    />

                    {/* Advanced Charts */}
                    <AdvancedAnalyticsCharts
                        moodData={moodData}
                        trendsData={trends}
                        yearComparisonData={yearComparison}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
