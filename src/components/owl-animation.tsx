"use client"

import { useEffect, useState } from "react"

export function OwlAnimation() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Play animation on every page load with a slight delay
        const timer = setTimeout(() => {
            setIsVisible(true)

            // Hide after animation completes
            setTimeout(() => {
                setIsVisible(false)
            }, 8000)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <div className="owl-container absolute top-[15%] -right-20">
                <div className="relative text-5xl sm:text-7xl filter drop-shadow-lg transform -scale-x-100">
                    🦉
                    <div className="absolute top-8 left-2 text-2xl sm:text-4xl transform rotate-12">
                        ✉️
                    </div>
                </div>
            </div>

            <style jsx>{`
                .owl-container {
                    animation: owl-fly 8s linear forwards;
                }

                @keyframes owl-fly {
                    0% {
                        transform: translateX(0) translateY(0);
                    }
                    25% {
                        transform: translateX(-30vw) translateY(20px);
                    }
                    50% {
                        transform: translateX(-60vw) translateY(-10px);
                    }
                    75% {
                        transform: translateX(-90vw) translateY(10px);
                    }
                    100% {
                        transform: translateX(-120vw) translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}
