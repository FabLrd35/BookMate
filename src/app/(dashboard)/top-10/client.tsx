"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Edit, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TopBooksPodium } from "@/components/top-books-podium"
import { TopBooksList } from "@/components/top-books-list"
import { TopBooksEditor } from "@/components/top-books-editor"

type Book = {
    id: string
    title: string
    coverUrl: string | null
    rating: number | null
    author: {
        name: string
    }
    genre?: {
        name: string
    } | null
}

type TopBookWithBook = {
    id: string
    year: number
    position: number
    bookId: string
    book: Book
}

type TopBooksClientProps = {
    initialTopBooks: TopBookWithBook[]
    availableYears: number[]
    selectedYear: number
    readBooks: Book[]
}

export function TopBooksClient({ initialTopBooks, availableYears, selectedYear, readBooks }: TopBooksClientProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)

    const handleYearChange = (year: string) => {
        router.push(`/top-10?year=${year}`)
    }

    const handleSave = () => {
        setIsEditing(false)
        router.refresh()
    }

    const hasTopBooks = initialTopBooks.length > 0

    return (
        <div className="container max-w-6xl py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        Top 10 des Livres
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Vos meilleurs livres de l'année
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {hasTopBooks ? "Modifier" : "Créer"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Sélectionnez vos 10 livres préférés</CardTitle>
                        <CardDescription>
                            Choisissez et organisez vos meilleurs livres de {selectedYear}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopBooksEditor
                            year={selectedYear}
                            availableBooks={readBooks}
                            initialSelection={initialTopBooks.map(tb => tb.bookId)}
                            onSave={handleSave}
                            onCancel={() => setIsEditing(false)}
                        />
                    </CardContent>
                </Card>
            ) : hasTopBooks ? (
                <>
                    {/* Podium */}
                    <TopBooksPodium topBooks={initialTopBooks} />

                    {/* Remaining Books */}
                    {initialTopBooks.length > 3 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Le reste du Top 10
                            </h2>
                            <TopBooksList topBooks={initialTopBooks} />
                        </div>
                    )}
                </>
            ) : (
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            Aucun Top 10 pour {selectedYear}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Créez votre Top 10 des meilleurs livres que vous avez lus cette année !
                        </p>
                        <Button onClick={() => setIsEditing(true)} size="lg">
                            <Edit className="h-4 w-4 mr-2" />
                            Créer mon Top 10
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
