"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quote, RefreshCw } from "lucide-react"
import { quotes } from "@/lib/motivation-data"

export function QuoteCard() {
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

    return (
        <Card className="w-full overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-none shadow-lg">
            <CardContent className="p-8 md:p-12 flex flex-col items-center text-center relative">
                <Quote className="absolute top-6 left-6 h-12 w-12 text-indigo-200 dark:text-indigo-800 opacity-50" />
                <Quote className="absolute bottom-6 right-6 h-12 w-12 text-indigo-200 dark:text-indigo-800 opacity-50 rotate-180" />

                <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-indigo-950 dark:text-indigo-100 leading-relaxed mb-6">
                        « {currentQuote.text} »
                    </h2>
                    <p className="text-lg text-indigo-600 dark:text-indigo-300 font-medium">
                        — {currentQuote.author}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"
                    onClick={handleNewQuote}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
                    Une autre citation
                </Button>
            </CardContent>
        </Card>
    )
}
