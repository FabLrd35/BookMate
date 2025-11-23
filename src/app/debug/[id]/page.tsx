import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function DebugBookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const book = await prisma.book.findUnique({ where: { id } })

    if (!book) notFound()

    // Fetch raw column info to verify DB schema
    const columnInfo = await prisma.$queryRaw`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'Book' AND column_name = 'rating';
    `

    async function forceUpdateRating(formData: FormData) {
        "use server"
        const bookId = formData.get("bookId") as string
        const ratingInput = formData.get("rating")

        console.log("--- DEBUG START ---")
        console.log(`[DEBUG] Book ID: ${bookId}`)
        console.log(`[DEBUG] Raw Input: "${ratingInput}"`)

        let ratingNum: number | null = null
        if (ratingInput) {
            ratingNum = parseFloat(ratingInput.toString())
            console.log(`[DEBUG] Parsed Float: ${ratingNum}`)
            console.log(`[DEBUG] Is Integer? ${Number.isInteger(ratingNum)}`)
        }

        try {
            console.log(`[DEBUG] Attempting update with:`, { rating: ratingNum })

            const result = await prisma.book.update({
                where: { id: bookId },
                data: { rating: ratingNum },
                select: { id: true, rating: true }
            })

            console.log(`[DEBUG] Update Result:`, result)
            console.log(`[DEBUG] Result Rating Type:`, typeof result.rating)

            // Double check by reading it back fresh
            const freshRead = await prisma.book.findUnique({
                where: { id: bookId },
                select: { rating: true }
            })
            console.log(`[DEBUG] Fresh Read:`, freshRead)

        } catch (error) {
            console.error(`[DEBUG] Update FAILED:`, error)
        }
        console.log("--- DEBUG END ---")

        revalidatePath(`/debug/${bookId}`)
        revalidatePath(`/books/${bookId}`)
    }

    return (
        <div className="p-8 space-y-8 font-mono text-sm">
            <h1 className="text-2xl font-bold">DEBUG BOOK: {book.title}</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-slate-100 p-4 rounded border">
                    <h2 className="font-bold mb-2">Database Schema Info</h2>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(columnInfo, null, 2)}
                    </pre>
                    <p className="text-xs text-gray-500 mt-2">
                        Expected: data_type: "double precision" or "float"
                    </p>
                </div>

                <div className="bg-slate-100 p-4 rounded border">
                    <h2 className="font-bold mb-2">Current Record</h2>
                    <div className="space-y-1">
                        <div>ID: {book.id}</div>
                        <div>Rating: <span className="bg-yellow-200 px-1">{String(book.rating)}</span></div>
                        <div>Type: {typeof book.rating}</div>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 p-4 rounded border border-red-200">
                <h2 className="font-bold mb-2">Force Update Test</h2>
                <form action={forceUpdateRating} className="flex gap-4 items-end">
                    <input type="hidden" name="bookId" value={book.id} />
                    <label className="block">
                        <span className="block text-sm font-bold mb-1">New Rating (ex: 3.5)</span>
                        <input
                            type="number"
                            name="rating"
                            step="0.1"
                            className="border p-2 rounded w-32"
                            defaultValue={String(book.rating || "")}
                        />
                    </label>
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">
                        UPDATE & LOG
                    </button>
                </form>
                <p className="mt-2 text-xs text-red-600">
                    Check your server console/terminal for logs after clicking.
                </p>
            </div>

            <div className="bg-slate-900 text-slate-50 p-4 rounded overflow-auto max-h-96">
                <h2 className="font-bold mb-2 text-green-400">Full Object Dump</h2>
                <pre>
                    {JSON.stringify(book, null, 2)}
                </pre>
            </div>
        </div>
    )
}

