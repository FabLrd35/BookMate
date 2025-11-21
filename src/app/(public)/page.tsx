import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, BarChart3, Target, Quote, Languages, Sparkles } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            BookMate
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Se connecter</Button>
                        </Link>
                        <Link href="/register">
                            <Button>S'inscrire gratuitement</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        Votre bibliothèque personnelle,{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            réinventée
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Organisez vos lectures, suivez vos progrès, enrichissez votre vocabulaire
                        et atteignez vos objectifs de lecture avec BookMate.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="text-lg px-8">
                                Commencer gratuitement
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="text-lg px-8">
                                Se connecter
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Tout ce dont vous avez besoin pour gérer vos lectures
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Des outils puissants pour les lecteurs passionnés
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Bibliothèque organisée</h3>
                        <p className="text-muted-foreground">
                            Gérez vos livres par statut, genre, auteur et créez des collections personnalisées.
                        </p>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Objectifs de lecture</h3>
                        <p className="text-muted-foreground">
                            Fixez-vous des objectifs mensuels et annuels, suivez vos progrès en temps réel.
                        </p>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Statistiques détaillées</h3>
                        <p className="text-muted-foreground">
                            Visualisez vos habitudes de lecture avec des graphiques et analyses approfondies.
                        </p>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                            <Languages className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Lexique personnel</h3>
                        <p className="text-muted-foreground">
                            Enrichissez votre vocabulaire en sauvegardant les mots découverts avec leurs définitions.
                        </p>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
                            <Quote className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Citations favorites</h3>
                        <p className="text-muted-foreground">
                            Conservez et organisez vos passages préférés pour les retrouver facilement.
                        </p>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Motivation quotidienne</h3>
                        <p className="text-muted-foreground">
                            Badges, défis et encouragements pour maintenir votre rythme de lecture.
                        </p>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Prêt à transformer votre expérience de lecture ?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Rejoignez BookMate gratuitement et commencez à organiser votre bibliothèque dès aujourd'hui.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="text-lg px-8">
                            Créer mon compte gratuit
                        </Button>
                    </Link>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
                <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
                    <p>© 2025 BookMate. Votre compagnon de lecture personnel.</p>
                </div>
            </footer>
        </div>
    )
}
