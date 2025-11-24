"use client";

import { useState, useEffect } from "react";
import { ReadingHeatmap } from "@/components/reading-heatmap";
import { StreakDisplay } from "@/components/streak-display";
import { DayActivityDialog } from "@/components/day-activity-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import {
    getReadingActivityForYear,
    getCurrentStreak,
    getLongestStreak,
    populateActivityFromBooks,
} from "@/app/actions/reading-activity";
import { toast } from "sonner";

export default function CalendarPage() {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [activityMap, setActivityMap] = useState<Record<string, number>>({});
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalBooks, setTotalBooks] = useState(0);

    useEffect(() => {
        loadData();
    }, [currentYear]);

    async function loadData() {
        setLoading(true);
        const [activityResult, currentStreakResult, longestStreakResult] = await Promise.all([
            getReadingActivityForYear(currentYear),
            getCurrentStreak(),
            getLongestStreak(),
        ]);
        if (activityResult.success) {
            setActivityMap(activityResult.activityMap);
            // Count unique books instead of summing activities
            const uniqueBooks = new Set(activityResult.activities.map((a: any) => a.book.id));
            setTotalBooks(uniqueBooks.size);
        }
        if (currentStreakResult.success) setCurrentStreak(currentStreakResult.streak);
        if (longestStreakResult.success) setLongestStreak(longestStreakResult.streak);
        setLoading(false);
    }

    async function handlePopulateData() {
        const result = await populateActivityFromBooks();
        if (result.success) {
            toast.success(`${result.created} activités créées!`);
            loadData();
        } else {
            toast.error("Échec du peuplement des données");
        }
    }

    function handleDayClick(date: string) {
        setSelectedDate(date);
        setDialogOpen(true);
    }

    function handlePreviousYear() {
        setCurrentYear((p) => p - 1);
    }

    function handleNextYear() {
        const thisYear = new Date().getFullYear();
        if (currentYear < thisYear) setCurrentYear((p) => p + 1);
    }

    const activeDays = Object.keys(activityMap).length;
    const thisYear = new Date().getFullYear();

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        Calendrier de Lecture
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Visualisez votre activité de lecture au fil du temps
                    </p>
                </div>
                <Button onClick={handlePopulateData} variant="outline" className="w-full sm:w-auto">
                    <CalendarIcon className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Peupler les données</span>
                    <span className="sm:hidden">Peupler</span>
                </Button>
            </div>

            {/* Streak */}
            <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-950">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">{totalBooks}</p>
                            <p className="text-xs text-muted-foreground">Livres en {currentYear}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-950">
                            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">{activeDays}</p>
                            <p className="text-xs text-muted-foreground">Jours actifs</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950">
                            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">
                                {activeDays > 0 ? Math.round((activeDays / 365) * 100) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground">De l'année</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Year navigation */}
            <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={handlePreviousYear}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-base sm:text-lg font-semibold min-w-[80px] sm:min-w-[100px] text-center">
                    {currentYear}
                </span>
                <Button variant="outline" size="icon" onClick={handleNextYear} disabled={currentYear >= thisYear}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Heatmap */}
            <div className="w-full max-h-[500px] overflow-y-auto overflow-x-hidden p-3 sm:p-4">
                {loading ? (
                    <Card className="p-4 sm:p-3">
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" />
                                <p className="text-sm text-muted-foreground">Chargement...</p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <ReadingHeatmap year={currentYear} activityMap={activityMap} onDayClick={handleDayClick} />
                )}
            </div>

            {/* Dialog */}
            <DayActivityDialog date={selectedDate} open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
    );
}
