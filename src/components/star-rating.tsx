"use client"

import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
    rating: number
    size?: "sm" | "md" | "lg"
    showValue?: boolean
    className?: string
}

export function StarRating({ rating, size = "md", showValue = false, className }: StarRatingProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    }

    const iconSize = sizeClasses[size]

    // Generate array of 5 stars
    const stars = Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        const filled = rating >= starValue
        const halfFilled = rating >= starValue - 0.5 && rating < starValue

        return (
            <span key={index} className="relative inline-block">
                {halfFilled ? (
                    <>
                        {/* Background empty star */}
                        <Star className={cn(iconSize, "text-gray-300 dark:text-gray-600")} />
                        {/* Foreground half star */}
                        <StarHalf
                            className={cn(iconSize, "absolute top-0 left-0 fill-yellow-400 text-yellow-400")}
                        />
                    </>
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
                    {rating.toFixed(1)}/5
                </span>
            )}
        </div>
    )
}
