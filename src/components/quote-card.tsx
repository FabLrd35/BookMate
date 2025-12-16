"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quote, RefreshCw } from "lucide-react"
import { quotes } from "@/lib/motivation-data"

interface QuoteCardProps {
    theme?: 'teal' | 'purple'
}

export function QuoteCard({ theme = 'teal' }: QuoteCardProps) {
    const [currentQuote, setCurrentQuote] = useState(quotes[0])
    const [isAnimating, setIsAnimating] = useState(false)

    // Hydration fix: set random quote only on client
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length)
        setCurrentQuote(quotes[randomIndex])
    }, [])

    const handleNewQuote = () => {
        setIsAnimating(true)
        setTimeout(() => {
            let newIndex
            do {
                newIndex = Math.floor(Math.random() * quotes.length)
            } while (quotes[newIndex].text === currentQuote.text)

            setCurrentQuote(quotes[newIndex])
            setIsAnimating(false)
        }, 300)
    }

    const gradients = {
        teal: "from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30",
        purple: "from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30"
    }

    const textColors = {
        teal: {
            quote: "text-teal-950 dark:text-teal-100",
            author: "text-teal-600 dark:text-teal-300",
            icon: "text-teal-200 dark:text-teal-800",
            button: "text-teal-400 hover:text-teal-600 hover:bg-teal-100/50 dark:hover:bg-teal-900/30"
        },
        purple: {
            quote: "text-purple-950 dark:text-purple-100",
            author: "text-purple-600 dark:text-purple-300",
            icon: "text-purple-200 dark:text-purple-800",
            button: "text-purple-400 hover:text-purple-600 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"
        }
    }

    const currentColors = textColors[theme]

    return (
        <Card className={`w-full overflow-hidden bg-gradient-to-br ${gradients[theme]} border-none shadow-lg`}>
            <CardContent className="p-8 md:p-12 flex flex-col items-center text-center relative">
                <Quote className={`absolute top-6 left-6 h-12 w-12 opacity-50 ${currentColors.icon}`} />
                <Quote className={`absolute bottom-6 right-6 h-12 w-12 opacity-50 rotate-180 ${currentColors.icon}`} />

                <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <h2 className={`text-2xl md:text-3xl font-serif font-medium leading-relaxed mb-6 ${currentColors.quote}`}>
                        « {currentQuote.text} »
                    </h2>
                    <p className={`text-lg font-medium ${currentColors.author}`}>
                        — {currentQuote.author}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className={`mt-8 ${currentColors.button}`}
                    onClick={handleNewQuote}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
                    Une autre citation
                </Button>
            </CardContent>
        </Card>
    )
}
