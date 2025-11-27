"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"

interface BadgeDisplayProps {
    badge: {
        name: string
        description: string
        icon: string
        category: string
        unlockedAt?: Date
    }
    locked?: boolean
}

export function BadgeDisplay({ badge, locked = false }: BadgeDisplayProps) {
    return (
        <Card className={cn(
            "p-4 flex flex-col items-center text-center transition-all hover:scale-105",
            locked ? "opacity-60 bg-muted/50" : "bg-gradient-to-br from-card to-accent/10 border-primary/20"
        )}>
            <div className={cn(
                "text-4xl mb-3 p-3 rounded-full relative",
                locked ? "bg-muted grayscale filter" : "bg-primary/10"
            )}>
                {badge.icon}
                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                )}
            </div>

            <h3 className={cn(
                "font-semibold mb-1",
                locked && "text-muted-foreground"
            )}>
                {badge.name}
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {badge.description}
            </p>

            {!locked && badge.unlockedAt && (
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                </span>
            )}

            {locked && (
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Verrouillé
                </span>
            )}
        </Card>
    )
}
