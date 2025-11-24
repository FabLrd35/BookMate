"use client"

export function ChristmasLights() {
    const lights = [
        { color: 'bg-red-500', delay: '0s' },
        { color: 'bg-yellow-400', delay: '0.2s' },
        { color: 'bg-green-500', delay: '0.4s' },
        { color: 'bg-blue-500', delay: '0.6s' },
        { color: 'bg-purple-500', delay: '0.8s' },
        { color: 'bg-pink-500', delay: '1s' },
        { color: 'bg-red-500', delay: '1.2s', hideOnMobile: true },
        { color: 'bg-yellow-400', delay: '1.4s', hideOnMobile: true },
        { color: 'bg-green-500', delay: '1.6s', hideOnMobile: true },
        { color: 'bg-blue-500', delay: '1.8s', hideOnMobile: true },
    ]

    return (
        <div className="relative w-full h-10 mb-4 pointer-events-none overflow-visible">
            {/* Fil de la guirlande */}
            <svg className="absolute top-0 w-full h-10" preserveAspectRatio="none" viewBox="0 0 1000 40">
                <path
                    d="M 0,8 Q 50,20 100,8 T 200,8 T 300,8 T 400,8 T 500,8 T 600,8 T 700,8 T 800,8 T 900,8 T 1000,8"
                    stroke="rgba(34, 139, 34, 0.6)"
                    strokeWidth="2"
                    fill="none"
                />
            </svg>

            {/* Lumières */}
            <div className="absolute top-0 left-0 right-0 flex justify-around px-4">
                {lights.map((light, index) => (
                    <div
                        key={index}
                        className={`relative ${light.hideOnMobile ? 'hidden md:block' : ''}`}
                        style={{
                            top: index % 2 === 0 ? '4px' : '12px',
                        }}
                    >
                        {/* Ampoule */}
                        <div
                            className={`w-3 h-4 ${light.color} rounded-full shadow-lg animate-twinkle`}
                            style={{
                                animationDelay: light.delay,
                                boxShadow: `0 0 10px currentColor`
                            }}
                        />
                        {/* Reflet */}
                        <div className="absolute top-0 left-1 w-1 h-1 bg-white rounded-full opacity-60" />
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.4;
                        transform: scale(0.9);
                    }
                }
                
                .animate-twinkle {
                    animation: twinkle 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
