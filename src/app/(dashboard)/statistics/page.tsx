import {
    getDetailedStats,
    getPagesReadStats,
    getReadingMoodAnalysis,
    getPreferencesAnalysis,
    getReadingTrends,
    getYearOverYearComparison,
    getReadingPrediction,
} from "@/app/actions/statistics"
import { MonthlyActivityChart } from "@/components/charts/monthly-activity-chart"
import { MonthlyPagesChart } from "@/components/charts/monthly-pages-chart"
import { RatingDistributionChart } from "@/components/charts/rating-distribution-chart"
import { MoodChart } from "@/components/charts/mood-chart"
import { TrendsChart } from "@/components/charts/trends-chart"
import { YearComparisonChart } from "@/components/charts/year-comparison-chart"
import { ReadingPrediction } from "@/components/reading-prediction"
import { PreferencesAnalysis } from "@/components/preferences-analysis"
import { BookOpen, BookCopy, FileText, TrendingUp } from "lucide-react"

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
        <div className="space-y-8 pb-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">Tableau de Bord</h1>
                <p className="text-muted-foreground mt-2">
                    Vue d'ensemble de vos activités et habitudes de lecture.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between space-y-0">
                        <span className="text-sm font-medium text-muted-foreground">Livres Lus</span>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalRead}</div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between space-y-0">
                        <span className="text-sm font-medium text-muted-foreground">Pages (Année)</span>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{pagesStats.totalPagesThisYear.toLocaleString('fr-FR')}</div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between space-y-0">
                        <span className="text-sm font-medium text-muted-foreground">Pages (Total)</span>
                        <BookCopy className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{pagesStats.totalPagesAllTime.toLocaleString('fr-FR')}</div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between space-y-0">
                        <span className="text-sm font-medium text-muted-foreground">Moyenne Pages/Livre</span>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{pagesStats.averagePagesPerBook.toLocaleString('fr-FR')}</div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <MonthlyActivityChart data={stats.monthlyActivity} />
                <MonthlyPagesChart data={pagesStats.monthlyPages} />
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-1">
                    <RatingDistributionChart data={stats.ratingDistribution} />
                </div>
                <div className="md:col-span-1">
                    <MoodChart data={moodData} />
                </div>
            </div>

            {/* Advanced Analysis */}
            <div className="grid gap-6 md:grid-cols-2">
                <TrendsChart data={trends} />
                <YearComparisonChart data={yearComparison} />
            </div>

            {/* Insights & Predictions */}
            <div className="grid gap-6 md:grid-cols-2">
                <ReadingPrediction prediction={prediction} />
                <PreferencesAnalysis
                    topAuthors={preferences.topAuthors}
                />
            </div>
        </div>
    )
}
