"use client"

import { useEffect, useState } from "react"

export function SantaSleigh() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Play animation on every page load
        const timer = setTimeout(() => {
            setIsVisible(true)

            // Hide after animation completes (8 seconds)
            setTimeout(() => {
                setIsVisible(false)
            }, 8000)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Santa and sleigh */}
            <div
                className="absolute top-[15%] sm:top-[20%] -right-[200px] sm:-right-[300px] santa-animation"
            >
                {/* Sleigh with Santa */}
                <div className="relative flex items-center gap-2 sm:gap-4">
                    {/* Reindeer */}
                    <div className="flex gap-1 sm:gap-2 text-3xl sm:text-6xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                        <span className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '0.5s' }}>🦌</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.5s' }}>🦌</span>
                        <span className="animate-bounce hidden sm:inline" style={{ animationDelay: '0.2s', animationDuration: '0.5s' }}>🦌</span>
                    </div>

                    {/* Sleigh */}
                    <div className="relative text-4xl sm:text-7xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                        🛷
                        {/* Santa on sleigh */}
                        <div className="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 text-3xl sm:text-6xl">
                            🎅
                        </div>
                        {/* Gift bag */}
                        <div className="absolute -top-2 sm:-top-4 -right-3 sm:-right-6 text-2xl sm:text-4xl">
                            🎁
                        </div>
                    </div>
                </div>

                {/* Sparkles trail */}
                <div className="absolute top-1/2 -left-10 sm:-left-20 flex gap-2 sm:gap-4 text-xl sm:text-3xl opacity-70">
                    <span className="animate-ping" style={{ animationDuration: '1s' }}>✨</span>
                    <span className="animate-ping" style={{ animationDuration: '1.2s' }}>⭐</span>
                    <span className="animate-ping hidden sm:inline" style={{ animationDuration: '1.4s' }}>✨</span>
                </div>
            </div>

            {/* Snowflakes - fewer on mobile */}
            <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-lg sm:text-2xl opacity-70"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-20px`,
                            animation: `snowfall ${5 + Math.random() * 5}s linear infinite`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    >
                        ❄️
                    </div>
                ))}
                {/* Extra snowflakes only on desktop */}
                {[...Array(7)].map((_, i) => (
                    <div
                        key={`extra-${i}`}
                        className="hidden sm:block absolute text-2xl opacity-70"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-20px`,
                            animation: `snowfall ${5 + Math.random() * 5}s linear infinite`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    >
                        ❄️
                    </div>
                ))}
            </div>

            <style jsx>{`
                .santa-animation {
                    animation: santa-fly 6s linear forwards;
                }

                @media (min-width: 640px) {
                    .santa-animation {
                        animation: santa-fly 8s linear forwards;
                    }
                }

                @keyframes santa-fly {
                    0% {
                        transform: translateX(0) translateY(0) rotate(-5deg);
                    }
                    50% {
                        transform: translateX(-60vw) translateY(-20px) rotate(-8deg);
                    }
                    100% {
                        transform: translateX(-120vw) translateY(0) rotate(-5deg);
                    }
                }

                @keyframes snowfall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.7;
                    }
                    90% {
                        opacity: 0.7;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }

                /* Ensure smooth animation on mobile */
                @media (max-width: 640px) {
                    @keyframes santa-fly {
                        0% {
                            transform: translateX(0) translateY(0) rotate(-5deg) scale(0.8);
                        }
                        50% {
                            transform: translateX(-90vw) translateY(-15px) rotate(-8deg) scale(0.8);
                        }
                        100% {
                            transform: translateX(-180vw) translateY(0) rotate(-5deg) scale(0.8);
                        }
                    }
                }
            `}</style>
        </div>
    )
}
