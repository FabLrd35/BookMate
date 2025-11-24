import { prisma } from "@/lib/prisma"
import { ReviewsList } from "@/components/reviews-list"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ReviewsPage() {
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

    const reviews = await prisma.book.findMany({
        where: {
            userId: user.id,
            status: "READ",
            comment: { not: null },
        },
        include: {
            author: true,
            genre: true,
        },
        orderBy: {
            finishDate: 'desc',
        },
    })


    const reviewsData = reviews.map(book => ({
        ...book,
        rating: book.rating ? Number(book.rating) : null
    }))


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Critiques</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Vos avis et notes sur les livres que vous avez lus.
                </p>
            </div>

            {/* Reviews List with Pagination */}
            <ReviewsList reviews={reviewsData} />
        </div>
    )
}
