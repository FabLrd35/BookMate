"use client"

import { useEffect, useState } from "react"

interface Snowflake {
    id: number
    left: number
    startY: number
    animationDuration: number
    animationDelay: number
    opacity: number
    size: number
}

export function SnowfallEffect() {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Générer une seule salve de flocons avec positions de départ variées
        const flakes: Snowflake[] = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            startY: -20 - Math.random() * 20, // Démarrage entre -20vh et -40vh
            animationDuration: 5 + Math.random() * 3, // 5-8 secondes
            animationDelay: Math.random() * 0.5, // Délai aléatoire de 0-0.5s
            opacity: 0.4 + Math.random() * 0.6,
            size: 3 + Math.random() * 3, // 3-6px
        }))

        setSnowflakes(flakes)
        setIsVisible(true)

        // Masquer après que tous les flocons soient tombés (durée max + délai)
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 8500)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible || snowflakes.length === 0) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="snowflake absolute"
                    style={{
                        left: `${flake.left}%`,
                        top: `${flake.startY}vh`,
                        opacity: flake.opacity,
                        width: `${flake.size}px`,
                        height: `${flake.size}px`,
                        animationDuration: `${flake.animationDuration}s`,
                        animationDelay: `${flake.animationDelay}s`,
                    }}
                >
                    ❄
                </div>
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    85% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                .snowflake {
                    color: #fff;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
                    font-size: inherit;
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-iteration-count: 1;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    )
}
