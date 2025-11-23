"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"

export default function ReadingScenePage() {
    const [readingAnimation, setReadingAnimation] = useState(null)
    const [natureAnimation, setNatureAnimation] = useState(null)

    useEffect(() => {
        // Charger l'animation de lecture
        fetch('https://lottie.host/b4e6e8c8-4c0a-4c1e-9e3a-2f8c5d1e7b9a/xQz8K9vYHr.json')
            .then(res => res.json())
            .then(data => setReadingAnimation(data))
            .catch(err => console.error('Erreur chargement animation lecture:', err))

        // Charger l'animation de nature
        fetch('https://lottie.host/8e3f5a2d-6b1c-4f9e-8d2a-1c7b9e4f3a5d/pLm7N8kJhG.json')
            .then(res => res.json())
            .then(data => setNatureAnimation(data))
            .catch(err => console.error('Erreur chargement animation nature:', err))
    }, [])

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
            {/* Arrière-plan nature */}
            {natureAnimation && (
                <div className="absolute inset-0 opacity-30 dark:opacity-20">
                    <Lottie
                        animationData={natureAnimation}
                        loop
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Contenu principal */}
            <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
                {/* Titre */}
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
                        Plongez dans la lecture
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light">
                        Un moment de calme et de découverte
                    </p>
                </div>

                {/* Animation principale de lecture */}
                <div className="w-full max-w-2xl">
                    {readingAnimation ? (
                        <Lottie
                            animationData={readingAnimation}
                            loop
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    ) : (
                        <div className="w-full aspect-square bg-white/50 dark:bg-slate-800/50 rounded-3xl animate-pulse flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-amber-600 dark:text-amber-400"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de l'animation...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Citation inspirante */}
                <div className="mt-12 max-w-2xl text-center">
                    <blockquote className="text-lg md:text-xl italic text-gray-600 dark:text-gray-400 border-l-4 border-amber-500 dark:border-amber-400 pl-6 py-2">
                        "La lecture est une porte ouverte sur un monde enchanté."
                        <footer className="text-sm mt-2 not-italic text-gray-500 dark:text-gray-500">
                            — François Mauriac
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Effet de particules flottantes */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-400/30 dark:bg-amber-300/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${10 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                        opacity: 0;
                    }
                }
                .animate-float {
                    animation: float linear infinite;
                }
            `}</style>
        </div>
    )
}
