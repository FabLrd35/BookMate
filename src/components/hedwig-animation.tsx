"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function HedwigAnimation() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Play animation on every page load with a slight delay
        const timer = setTimeout(() => {
            setIsVisible(true)

            // Hide after animation completes
            setTimeout(() => {
                setIsVisible(false)
            }, 10000)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <div className="hedwig-container absolute top-[20%] -left-32">
                <div className="relative filter drop-shadow-2xl">
                    {/* Hedwig image */}
                    <Image
                        src="/headwige.png"
                        alt="Hedwige"
                        width={180}
                        height={180}
                        className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain"
                        priority
                    />
                    {/* Lettre */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xl sm:text-2xl transform rotate-6 animate-bounce">
                        ✉️
                    </div>
                    {/* Étoiles magiques */}
                    <div className="absolute top-2 right-2 text-lg sm:text-xl animate-ping">
                        ✨
                    </div>
                    {/* Plumes */}
                    <div className="absolute top-1/3 -right-4 text-base sm:text-lg animate-pulse opacity-70">
                        🪶
                    </div>
                    <div className="absolute bottom-1/3 -left-3 text-sm sm:text-base animate-pulse opacity-60 animation-delay-300">
                        🪶
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hedwig-container {
                    animation: hedwig-fly 10s ease-in-out forwards;
                }

                @keyframes hedwig-fly {
                    0% {
                        transform: translateX(0) translateY(0) rotate(0deg);
                    }
                    8% {
                        transform: translateX(12vw) translateY(-30px) rotate(5deg);
                    }
                    16% {
                        transform: translateX(25vw) translateY(25px) rotate(-3deg);
                    }
                    24% {
                        transform: translateX(38vw) translateY(-35px) rotate(6deg);
                    }
                    32% {
                        transform: translateX(50vw) translateY(30px) rotate(-4deg);
                    }
                    40% {
                        transform: translateX(62vw) translateY(-40px) rotate(7deg);
                    }
                    48% {
                        transform: translateX(74vw) translateY(20px) rotate(-5deg);
                    }
                    56% {
                        transform: translateX(86vw) translateY(-25px) rotate(4deg);
                    }
                    64% {
                        transform: translateX(98vw) translateY(35px) rotate(-6deg);
                    }
                    72% {
                        transform: translateX(110vw) translateY(-30px) rotate(5deg);
                    }
                    80% {
                        transform: translateX(122vw) translateY(15px) rotate(-3deg);
                    }
                    88% {
                        transform: translateX(134vw) translateY(-20px) rotate(2deg);
                    }
                    100% {
                        transform: translateX(150vw) translateY(0) rotate(0deg);
                    }
                }

                .animation-delay-300 {
                    animation-delay: 300ms;
                }
            `}</style>
        </div>
    )
}
