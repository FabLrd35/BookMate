"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

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
            <div className="harry-container absolute top-[15%] -right-32">
                <div className="relative filter drop-shadow-2xl">
                    {/* Harry Potter image */}
                    <Image
                        src="/harry.png"
                        alt="Harry Potter"
                        width={150}
                        height={150}
                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
                        priority
                    />
                    {/* Éclair magique */}
                    <div className="absolute -top-2 -right-2 text-2xl sm:text-3xl animate-pulse">
                        ⚡
                    </div>
                    {/* Lettre de Poudlard */}
                    <div className="absolute -bottom-2 -left-2 text-xl sm:text-2xl transform rotate-12 animate-bounce">
                        ✉️
                    </div>
                    {/* Étoiles magiques */}
                    <div className="absolute top-1/2 -left-4 text-lg sm:text-xl animate-ping">
                        ✨
                    </div>
                </div>
            </div>

            <style jsx>{`
                .harry-container {
                    animation: harry-fly 8s linear forwards;
                }

                @keyframes harry-fly {
                    0% {
                        transform: translateX(0) translateY(0) rotate(0deg);
                    }
                    10% {
                        transform: translateX(-15vw) translateY(-40px) rotate(-8deg);
                    }
                    25% {
                        transform: translateX(-30vw) translateY(30px) rotate(5deg);
                    }
                    40% {
                        transform: translateX(-50vw) translateY(-50px) rotate(-10deg);
                    }
                    55% {
                        transform: translateX(-70vw) translateY(40px) rotate(8deg);
                    }
                    70% {
                        transform: translateX(-90vw) translateY(-30px) rotate(-5deg);
                    }
                    85% {
                        transform: translateX(-110vw) translateY(20px) rotate(3deg);
                    }
                    100% {
                        transform: translateX(-140vw) translateY(0) rotate(0deg);
                    }
                }
            `}</style>
        </div>
    )
}
