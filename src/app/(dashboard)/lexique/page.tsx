import { prisma } from "@/lib/prisma"
import { WordList } from "@/components/word-list"
import { AddWordDialog } from "@/components/add-word-dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LexiquePage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        redirect("/login")
    }

    const words = await prisma.word.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            book: {
                select: {
                    title: true,
                },
            },
        },
    })

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mon Lexique</h1>
                    <p className="text-muted-foreground text-sm sm:text-base mt-1">
                        Retrouvez tous les mots que vous avez appris au fil de vos lectures.
                    </p>
                </div>
                <AddWordDialog />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total des mots
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{words.length}</div>
                        <p className="text-xs text-muted-foreground">
                            mots enregistrés
                        </p>
                    </CardContent>
                </Card>
            </div>

            <WordList initialWords={words} />
        </div>
    )
}
