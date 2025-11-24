"use client"

import { useState } from "react"
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

export function GoalCard({ year, month, currentMonthly, currentAnnual, targetMonthly, targetAnnual }: GoalCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [period, setPeriod] = useState<GoalPeriod>("ANNUAL")
    const [newTarget, setNewTarget] = useState("")

    // Determine which goal to display based on period
    const current = period === "MONTHLY" ? currentMonthly : currentAnnual
    const target = period === "MONTHLY" ? targetMonthly : targetAnnual

    const hasGoal = target !== null
    const percentage = hasGoal ? Math.min(100, Math.round((current / target) * 100)) : 0
    const remaining = hasGoal ? Math.max(0, target - current) : 0

    const data = [
        { name: "Read", value: current },
        { name: "Remaining", value: hasGoal ? Math.max(0, target - current) : 1 },
    ]

    const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long' })

    function handleOpenDialog() {
        setNewTarget(target?.toString() || (period === "MONTHLY" ? "4" : "12"))
        setIsOpen(true)
    }

    async function handleSave() {
        const targetNum = parseInt(newTarget)
        if (!isNaN(targetNum) && targetNum > 0) {
            await setReadingGoal(period, year, targetNum, period === "MONTHLY" ? month : undefined)
            setIsOpen(false)
        }
    }

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                        Objectif {period === "MONTHLY" ? monthName : year}
                    </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={(value) => setPeriod(value as GoalPeriod)}>
                        <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MONTHLY">Mensuel</SelectItem>
                            <SelectItem value="ANNUAL">Annuel</SelectItem>
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
                                    Combien de livres souhaitez-vous lire {period === "MONTHLY" ? `en ${monthName}` : `en ${year}`} ?
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
                        {hasGoal ? (
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
                                    data={data}
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
                                    {data.map((entry, index) => (
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
