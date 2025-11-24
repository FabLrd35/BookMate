import { Card } from "@/components/ui/card"
import { BookOpen, BookMarked, CheckCircle2, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { getDashboardStats, getRecentBooks } from "@/app/actions/statistics"
import { getReadingGoal } from "@/app/actions/goals"
import { GoalCard } from "@/components/goal-card"
import { SnowfallEffect } from "@/components/snowfall-effect"
import { ChristmasTitle } from "@/components/christmas-title"
import { ChristmasLights } from "@/components/christmas-lights"

export default async function Home() {
  const stats = await getDashboardStats()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-indexed

  const [monthlyGoal, annualGoal, recentBooks] = await Promise.all([
    getReadingGoal("MONTHLY", currentYear, currentMonth),
    getReadingGoal("ANNUAL", currentYear),
    getRecentBooks(),
  ])

  const statusColors = {
    TO_READ: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    READING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    READ: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    ABANDONED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  }

  const statusLabels = {
    TO_READ: "À lire",
    READING: "En cours",
    READ: "Terminé",
    ABANDONED: "Abandonné",
  }

  return (
    <div className="space-y-8">
      <SnowfallEffect />
      {/* Header */}
      <div>
        <ChristmasLights />
        <ChristmasTitle />
        <p className="text-muted-foreground mt-2">
          Bon retour ! Voici votre aperçu de lecture.
        </p>
      </div>

      {/* Goal Section */}
      <div className="w-full">
        <GoalCard
          year={currentYear}
          month={currentMonth}
          currentMonthly={stats.thisMonth}
          currentAnnual={stats.readThisYear}
          targetMonthly={monthlyGoal?.target ?? null}
          targetAnnual={annualGoal?.target ?? null}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">À lire</p>
              <p className="text-3xl font-bold mt-2">{stats.toRead}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En cours</p>
              <p className="text-3xl font-bold mt-2">{stats.reading}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <BookMarked className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Terminés</p>
              <p className="text-3xl font-bold mt-2">{stats.read}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ce mois-ci</p>
              <p className="text-3xl font-bold mt-2">{stats.thisMonth}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
        {recentBooks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Pas encore de livres. Commencez par ajouter votre premier livre !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Book Cover */}
                <div className="relative w-12 h-16 flex-shrink-0 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded overflow-hidden">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {book.author.name}
                  </p>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[book.status]}`}>
                  {statusLabels[book.status]}
                </span>

                {/* Date */}
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="whitespace-nowrap">
                    {new Date(book.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
