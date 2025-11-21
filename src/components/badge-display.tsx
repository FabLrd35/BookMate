"use client"

import { Card } from "@/components/ui/card"

interface Badge {
    id: string
    name: string
    description: string
    icon: string
    category: string
    unlockedAt: Date
}

interface BadgeDisplayProps {
    badge: Badge
}

export function BadgeDisplay({ badge }: BadgeDisplayProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-6xl mb-3">{badge.icon}</div>
            <h4 className="font-semibold text-lg mb-1">{badge.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">
                {badge.description}
            </p>
            <p className="text-xs text-muted-foreground">
                Débloqué le {formatDate(badge.unlockedAt)}
            </p>
        </Card>
    )
}

interface LockedBadgeProps {
    name: string
    icon: string
}

export function LockedBadge({ name, icon }: LockedBadgeProps) {
    return (
        <Card className="p-6 text-center opacity-40 grayscale">
            <div className="text-6xl mb-3 blur-sm">{icon}</div>
            <h4 className="font-semibold text-lg mb-1">???</h4>
            <p className="text-sm text-muted-foreground">
                Badge verrouillé
            </p>
        </Card>
    )
}
