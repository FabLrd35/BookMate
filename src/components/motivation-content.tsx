"use client"

import { useState, useEffect } from "react"
import { QuoteCard } from "@/components/quote-card"
import { BenefitCard } from "@/components/benefit-card"
import { benefits, tips } from "@/lib/motivation-data"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { HedwigAnimation } from "@/components/hedwig-animation"

export function MotivationContent() {
    const [theme, setTheme] = useState<'teal' | 'purple'>('teal')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Randomize theme on mount
        setTheme(Math.random() > 0.5 ? 'teal' : 'purple')
        setMounted(true)
    }, [])

    const themeColors = {
        teal: {
            sparkles: "text-teal-500",
            tipIcon: "text-teal-600 dark:text-teal-400"
        },
        purple: {
            sparkles: "text-purple-500",
            tipIcon: "text-purple-600 dark:text-purple-400"
        }
    }

    const currentColors = themeColors[theme]

    if (!mounted) {
        return <div className="min-h-screen" /> // Avoid hydration mismatch or flash
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-12 transition-colors duration-500">
            {/* Hedwig Easter Egg */}
            <HedwigAnimation />

            {/* Hero Section with Quote */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Sparkles className={`h-6 w-6 ${currentColors.sparkles}`} />
                    <h1 className="text-3xl font-bold tracking-tight">Motivation & Inspiration</h1>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                    Retrouvez ici votre dose quotidienne d'inspiration pour cultiver votre amour de la lecture.
                </p>
                <QuoteCard theme={theme} />
            </section>

            {/* Benefits Grid */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Pourquoi lire est essentiel</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <BenefitCard
                            key={index}
                            title={benefit.title}
                            description={benefit.description}
                            icon={benefit.icon}
                            color={benefit.color}
                            theme={theme}
                        />
                    ))}
                </div>
            </section>

            {/* Tips Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Conseils pour lire plus</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {tips.map((tip, index) => (
                        <Card key={index} className="bg-muted/30 border-none shadow-sm">
                            <CardContent className="p-6 flex gap-4">
                                <div className={`p-3 bg-background rounded-full h-fit shadow-sm ${currentColors.tipIcon}`}>
                                    <tip.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {tip.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
