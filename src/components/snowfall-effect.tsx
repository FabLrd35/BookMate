"use client"

import { useEffect, useState } from "react"

interface Snowflake {
    id: number
    left: number
    animationDuration: number
    opacity: number
    size: number
}

export function SnowfallEffect() {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Générer une seule salve de flocons à chaque visite
        const flakes: Snowflake[] = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDuration: 4 + Math.random() * 2, // 4-6 secondes
            opacity: 0.4 + Math.random() * 0.6,
            size: 3 + Math.random() * 3, // 3-6px
        }))

        setSnowflakes(flakes)
        setIsVisible(true)

        // Masquer après 6 secondes
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 6000)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible || snowflakes.length === 0) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="snowflake absolute animate-fall"
                    style={{
                        left: `${flake.left}%`,
                        opacity: flake.opacity,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        animationDuration: `${flake.animationDuration}s`,
                    }}
                >
                    ❄
                </div>
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% {
                        transform: translateY(-10vh) rotate(0deg);
                    }
                    100% {
                        transform: translateY(110vh) rotate(360deg);
                    }
                }
                
                .snowflake {
                    color: #fff;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
                    font-size: inherit;
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: 1;
                }
            `}</style>
        </div>
    )
}
