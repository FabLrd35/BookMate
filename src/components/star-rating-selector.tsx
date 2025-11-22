"use client"

import { useState } from "react"
import { Star, StarHalf } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingSelectorProps {
    value: number
    onChange: (value: number) => void
    size?: "sm" | "md" | "lg"
    className?: string
}

export function StarRatingSelector({ value, onChange, size = "lg", className }: StarRatingSelectorProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10"
    }

    const iconSize = sizeClasses[size]

    const handleClick = (starIndex: number, isHalf: boolean) => {
        const newValue = isHalf ? starIndex + 0.5 : starIndex + 1
        onChange(newValue)
    }

    const handleMouseMove = (starIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const isLeftHalf = x < rect.width / 2
        const hoverVal = isLeftHalf ? starIndex + 0.5 : starIndex + 1
        setHoverValue(hoverVal)
    }

    const handleMouseLeave = () => {
        setHoverValue(null)
    }

    const displayValue = hoverValue !== null ? hoverValue : value

    return (
        <div className={cn("flex gap-1", className)}>
            {[0, 1, 2, 3, 4].map((starIndex) => {
                const starValue = starIndex + 1
                const isFilled = displayValue >= starValue
                const isHalfFilled = displayValue >= starIndex + 0.5 && displayValue < starValue

                return (
                    <button
                        key={starIndex}
                        type="button"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const isLeftHalf = x < rect.width / 2
                            handleClick(starIndex, isLeftHalf)
                        }}
                        onMouseMove={(e) => handleMouseMove(starIndex, e)}
                        onMouseLeave={handleMouseLeave}
                        className="focus:outline-none transition-transform hover:scale-110 relative"
                    >
                        {isHalfFilled ? (
                            <>
                                {/* Background empty star */}
                                <Star
                                    className={cn(
                                        iconSize,
                                        "text-gray-300 dark:text-gray-600"
                                    )}
                                />
                                {/* Foreground half star */}
                                <StarHalf
                                    className={cn(
                                        iconSize,
                                        "absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                                    )}
                                />
                            </>
                        ) : (
                            <Star
                                className={cn(
                                    iconSize,
                                    "transition-colors",
                                    isFilled
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                )}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
