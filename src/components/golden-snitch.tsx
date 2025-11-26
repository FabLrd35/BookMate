"use client"

import { useEffect, useState } from "react"

export function GoldenSnitch() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Play animation on every page load with a slight delay
        const timer = setTimeout(() => {
            setIsVisible(true)

            // Hide after animation completes
            setTimeout(() => {
                setIsVisible(false)
            }, 6000)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <div className="snitch-container absolute top-1/4 -left-20">
                <div className="relative text-4xl sm:text-6xl filter drop-shadow-lg">
                    {/* Wings */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full flex justify-center items-center">
                        <span className="wing-left absolute -left-4 sm:-left-6 text-2xl sm:text-4xl opacity-80">🪽</span>
                        <span className="wing-right absolute -right-4 sm:-right-6 text-2xl sm:text-4xl opacity-80 scale-x-[-1]">🪽</span>
                    </div>
                    {/* Body */}
                    <div className="relative z-10 animate-spin-slow">
                        🟡
                    </div>
                    {/* Sparkles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                        <span className="absolute -top-2 -left-2 text-xs text-yellow-300 animate-ping">✨</span>
                        <span className="absolute -bottom-2 -right-2 text-xs text-yellow-300 animate-ping delay-100">✨</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .snitch-container {
                    animation: snitch-fly 5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
                }

                .wing-left {
                    animation: flutter 0.1s infinite alternate;
                    transform-origin: right center;
                }

                .wing-right {
                    animation: flutter 0.1s infinite alternate;
                    transform-origin: left center;
                }

                @keyframes flutter {
                    from { transform: rotate(0deg) scaleX(-1); }
                    to { transform: rotate(20deg) scaleX(-1); }
                }
                
                .wing-left {
                     animation: flutter-left 0.1s infinite alternate;
                }

                @keyframes flutter-left {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-20deg); }
                }

                @keyframes snitch-fly {
                    0% {
                        left: -100px;
                        top: 20%;
                        transform: scale(0.5);
                    }
                    20% {
                        left: 30%;
                        top: 40%;
                        transform: scale(1.2);
                    }
                    40% {
                        left: 60%;
                        top: 10%;
                        transform: scale(0.8);
                    }
                    60% {
                        left: 40%;
                        top: 60%;
                        transform: scale(1.1);
                    }
                    80% {
                        left: 80%;
                        top: 30%;
                        transform: scale(0.9);
                    }
                    100% {
                        left: 120%;
                        top: 20%;
                        transform: scale(0.5);
                    }
                }
            `}</style>
        </div>
    )
}
