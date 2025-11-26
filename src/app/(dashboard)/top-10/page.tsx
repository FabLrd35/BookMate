import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getTopBooks, getAvailableYears, getReadBooksForYear } from "@/app/actions/top-books"
import { TopBooksClient } from "@/app/(dashboard)/top-10/client"

export const metadata: Metadata = {
    title: "Top 10 | BookMate",
    description: "Vos meilleurs livres de l'année",
}

export default async function TopBooksPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string }>
}) {
    const session = await auth()
    if (!session?.user) {
        redirect("/login")
    }

    const params = await searchParams
    const yearsResult = await getAvailableYears()
    const years = yearsResult.success ? yearsResult.years : []

    const currentYear = params.year ? parseInt(params.year) : new Date().getFullYear()
    const selectedYear = years.includes(currentYear) ? currentYear : (years[0] || new Date().getFullYear())

    const [topBooksResult, readBooksResult] = await Promise.all([
        getTopBooks(selectedYear),
        getReadBooksForYear(selectedYear)
    ])

    const topBooks = topBooksResult.success ? topBooksResult.topBooks : []
    const readBooks = readBooksResult.success ? readBooksResult.books : []

    return (
        <TopBooksClient
            initialTopBooks={topBooks}
            availableYears={years}
            selectedYear={selectedYear}
            readBooks={readBooks}
        />
    )
}
