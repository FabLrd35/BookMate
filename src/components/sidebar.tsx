"use client"

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, LayoutDashboard, Library, BarChart3, Settings, Folder, Quote, MessageSquare, Users, Calendar, Sparkles, Languages, Menu, X, Star, Image as ImageIcon, Dices, Trophy, BookMarked } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Livres", href: "/books", icon: Library },
    { name: "Collections", href: "/collections", icon: Folder },
    { name: "Sagas", href: "/series", icon: BookMarked },
    { name: "Mes Auteurs", href: "/authors", icon: Users },
    { name: "Mes Citations", href: "/quotes", icon: Quote },
    { name: "Mon Lexique", href: "/lexique", icon: Languages },
    { name: "Mes Critiques", href: "/reviews", icon: MessageSquare },
    { name: "Calendrier", href: "/calendar", icon: Calendar },
    { name: "Top 10", href: "/top-10", icon: Trophy },
    { name: "Défis", href: "/challenges", icon: Star },
    { name: "Roulette de Lecture", href: "/roulette", icon: Dices },
    { name: "Motivation", href: "/motivation", icon: Sparkles },
    { name: "Statistiques", href: "/statistics", icon: BarChart3 },
    { name: "Ma Galerie", href: "/gallery", icon: ImageIcon },
]

interface SidebarContentProps {
    onNavigate?: () => void
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    BookMate
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                                isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
                <p className="text-xs text-muted-foreground text-center">
                    BookMate v1.0
                </p>
            </div>
        </>
    )
}

export function Sidebar() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="fixed top-4 left-4 z-40 lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                    <div className="flex h-full flex-col">
                        <SidebarContent onNavigate={() => setOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex h-full w-64 flex-col border-r bg-background">
                <SidebarContent />
            </div>
        </>
    )
}
