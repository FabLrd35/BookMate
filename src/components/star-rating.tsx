"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Decimal } from "@prisma/client/runtime/library"

interface StarRatingProps {
    rating: number | Decimal
    size?: "sm" | "md" | "lg"
    showValue?: boolean
    className?: string
}

export function StarRating({ rating, size = "md", showValue = false, className }: StarRatingProps) {
    // Convert Decimal to number if needed
    const numericRating = typeof rating === 'number' ? rating : Number(rating)
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    }

    const iconSize = sizeClasses[size]

    // Generate array of 5 stars
    const stars = Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        const filled = numericRating >= starValue
        const halfFilled = numericRating >= starValue - 0.5 && numericRating < starValue

        return (
            <span key={index} className="relative inline-block">
                {halfFilled ? (
                    <div className="relative">
                        {/* Background empty star */}
                        <Star className={cn(iconSize, "text-gray-300 dark:text-gray-600")} />
                        {/* Foreground half star (clipped) */}
                        <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                            <Star className={cn(iconSize, "fill-yellow-400 text-yellow-400")} />
                        </div>
                    </div>
                ) : (
                    <Star
                        className={cn(
                            iconSize,
                            filled
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                        )}
                    />
                )}
            </span>
        )
    })

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {stars}
            {showValue && (
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                    {numericRating.toFixed(1)}/5
                </span>
            )}
        </div>
    )
}
