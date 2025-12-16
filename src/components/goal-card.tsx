"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { setReadingGoal } from "@/app/actions/goals"
import { Trophy, Edit2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { GoalPeriod } from "@prisma/client"

interface GoalCardProps {
    year: number
    month: number
    currentMonthly: number
    currentAnnual: number
    targetMonthly: number | null
    targetAnnual: number | null
}

export function GoalCard({ year: initialYear, month: initialMonth, currentMonthly: initialCurrentMonthly, currentAnnual: initialCurrentAnnual, targetMonthly: initialTargetMonthly, targetAnnual: initialTargetAnnual }: GoalCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [period, setPeriod] = useState<GoalPeriod>("ANNUAL")
    const [selectedYear, setSelectedYear] = useState(initialYear)
    const [newTarget, setNewTarget] = useState("")

    // Local state for fetched data (defaults to props)
    const [data, setData] = useState({
        currentMonthly: initialCurrentMonthly,
        currentAnnual: initialCurrentAnnual,
        targetMonthly: initialTargetMonthly,
        targetAnnual: initialTargetAnnual
    })

    const [isLoading, setIsLoading] = useState(false)

    // Fetch data when selectedYear changes
    useEffect(() => {
        if (selectedYear === initialYear) {
            // Revert to props if current year
            setData({
                currentMonthly: initialCurrentMonthly,
                currentAnnual: initialCurrentAnnual,
                targetMonthly: initialTargetMonthly,
                targetAnnual: initialTargetAnnual
            })
            return
        }

        async function fetchData() {
            setIsLoading(true)
            try {
                // Dynamically import imports to avoid huge bundle headers if possible, 
                // but simpler here to just assume we can call the server actions.
                // We need to import getReadingGoal and getDashboardStats inside component or use the ones imported at top.
                // Since they are server actions, we can call them.
                const { getReadingGoal } = await import("@/app/actions/goals")
                const { getDashboardStats } = await import("@/app/actions/statistics")

                const [stats, monthlyGoal, annualGoal] = await Promise.all([
                    getDashboardStats(selectedYear, initialMonth),
                    getReadingGoal("MONTHLY", selectedYear, initialMonth),
                    getReadingGoal("ANNUAL", selectedYear)
                ])

                setData({
                    currentMonthly: stats.thisMonth,
                    currentAnnual: stats.readThisYear,
                    targetMonthly: monthlyGoal?.target ?? null,
                    targetAnnual: annualGoal?.target ?? null
                })
            } catch (error) {
                console.error("Failed to fetch goal data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [selectedYear, initialYear, initialMonth, initialCurrentMonthly, initialCurrentAnnual, initialTargetMonthly, initialTargetAnnual])

    // Determine which goal to display based on period
    const current = period === "MONTHLY" ? data.currentMonthly : data.currentAnnual
    const target = period === "MONTHLY" ? data.targetMonthly : data.targetAnnual

    const hasGoal = target !== null
    const percentage = hasGoal ? Math.min(100, Math.round((current / target) * 100)) : 0
    const remaining = hasGoal ? Math.max(0, target - current) : 0

    const chartData = [
        { name: "Read", value: current },
        { name: "Remaining", value: hasGoal ? Math.max(0, target - current) : 1 },
    ]

    const monthName = new Date(selectedYear, initialMonth - 1).toLocaleString('fr-FR', { month: 'long' })

    function handleOpenDialog() {
        setNewTarget(target?.toString() || (period === "MONTHLY" ? "4" : "12"))
        setIsOpen(true)
    }

    async function handleSave() {
        const targetNum = parseInt(newTarget)
        if (!isNaN(targetNum) && targetNum > 0) {
            await setReadingGoal(period, selectedYear, targetNum, period === "MONTHLY" ? initialMonth : undefined)

            // Refresh local data immediately for better UX
            const { getReadingGoal } = await import("@/app/actions/goals")
            const updatedGoal = await getReadingGoal(period, selectedYear, period === "MONTHLY" ? initialMonth : undefined)

            setData(prev => ({
                ...prev,
                targetMonthly: period === "MONTHLY" ? (updatedGoal?.target ?? null) : prev.targetMonthly,
                targetAnnual: period === "ANNUAL" ? (updatedGoal?.target ?? null) : prev.targetAnnual
            }))

            setIsOpen(false)
        }
    }

    const availableYears = [initialYear, initialYear + 1]

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        Objectif {period === "MONTHLY" ? monthName : selectedYear}
                    </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    {/* Period Selector */}
                    <Select value={period} onValueChange={(value) => setPeriod(value as GoalPeriod)}>
                        <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MONTHLY">Mensuel</SelectItem>
                            <SelectItem value="ANNUAL">Annuel</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Year Selector */}
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger className="w-[80px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenDialog}>
                                <Edit2 className="h-4 w-4" />
                                <span className="sr-only">Modifier l'objectif</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Définir votre objectif de lecture</DialogTitle>
                                <DialogDescription>
                                    Combien de livres souhaitez-vous lire {period === "MONTHLY" ? `en ${monthName}` : `en ${selectedYear}`} ?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="target" className="text-right">
                                        Objectif
                                    </Label>
                                    <Input
                                        id="target"
                                        type="number"
                                        value={newTarget}
                                        onChange={(e) => setNewTarget(e.target.value)}
                                        className="col-span-3"
                                        min="1"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave}>Enregistrer</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        {isLoading ? (
                            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                        ) : hasGoal ? (
                            <>
                                <div className="text-2xl font-bold">
                                    {percentage}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {current} sur {target} livres lus
                                </p>
                                {remaining > 0 ? (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Encore {remaining} livre{remaining > 1 ? 's' : ''} pour atteindre votre but !
                                    </p>
                                ) : (
                                    <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                        <Trophy className="h-3 w-3" /> Objectif atteint !
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Aucun objectif défini pour cette période.
                            </div>
                        )}
                    </div>
                    <div className="h-[80px] w-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={20}
                                    outerRadius={32}
                                    paddingAngle={5}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                    cornerRadius={4}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 0 ? "var(--primary)" : "var(--muted)"}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
