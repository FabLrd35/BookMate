import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"

export default async function DebugBookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const book = await prisma.book.findUnique({ where: { id } })

    if (!book) notFound()

    async function forceUpdateRating(formData: FormData) {
        "use server"
        const bookId = formData.get("bookId") as string
        const ratingInput = formData.get("rating")
        const ratingNum = ratingInput ? parseFloat(ratingInput.toString()) : null

        console.log(`[DEBUG] Force Update for Book ID: ${bookId}`)
        console.log(`[DEBUG] Input Rating: "${ratingInput}"`)
        console.log(`[DEBUG] Parsed Rating: ${ratingNum} (Type: ${typeof ratingNum})`)

        try {
            const result = await prisma.book.update({
                where: { id: bookId },
                data: { rating: ratingNum },
                select: { id: true, rating: true }
            })
            console.log(`[DEBUG] Update Result:`, result)
        } catch (error) {
            console.error(`[DEBUG] Update FAILED:`, error)
        }

        revalidatePath(`/debug/${bookId}`)
        revalidatePath(`/books/${bookId}`)
    }

    return (
        <div className="p-8 space-y-8 font-mono">
            <h1 className="text-2xl font-bold">DEBUG BOOK: {book.title}</h1>

            <div className="bg-slate-100 p-4 rounded border">
                <h2 className="font-bold mb-2">Raw Data (JSON)</h2>
                <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(book, null, 2)}
                </pre>
            </div>

            <div className="bg-red-50 p-4 rounded border border-red-200">
                <h2 className="font-bold mb-2">NUCLEAR OPTION: Force Update</h2>
                <form action={forceUpdateRating} className="flex gap-4 items-end">
                    <input type="hidden" name="bookId" value={book.id} />
                    <label className="block">
                        <span className="block text-sm font-bold mb-1">New Rating (ex: 3.5)</span>
                        <input
                            type="number"
                            name="rating"
                            step="0.1"
                            className="border p-2 rounded"
                            defaultValue={String(book.rating || "")}
                        />
                    </label>
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">
                        FORCE UPDATE
                    </button>
                </form>
            </div>
        </div>
    )
}
