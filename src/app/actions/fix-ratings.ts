"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function recoverCorruptedRatings() {
    try {
        const books = await prisma.book.findMany({
            where: {
                rating: {
                    not: null,
                    lt: 0.1, // Only target corrupted values (which are tiny)
                    gt: 0    // But strictly positive (don't touch actual 0s if any)
                }
            },
            select: { id: true, rating: true, title: true }
        })

        let fixedCount = 0
        const logs = []

        for (const book of books) {
            if (!book.rating) continue

            // Convert to string to see the scientific notation
            // e.g., 1.5e-323 -> "1.5e-323"
            const ratingStr = String(book.rating)

            if (ratingStr.includes('e-')) {
                // Extract the mantissa (the "1.5" part)
                const originalValueStr = ratingStr.split('e')[0]
                const originalValue = parseFloat(originalValueStr)

                if (!isNaN(originalValue) && originalValue >= 0 && originalValue <= 5) {
                    await prisma.book.update({
                        where: { id: book.id },
                        data: { rating: originalValue }
                    })
                    fixedCount++
                    logs.push(`Fixed "${book.title}": ${book.rating} -> ${originalValue}`)
                }
            }
        }

        revalidatePath("/")
        revalidatePath("/books")

        return {
            success: true,
            message: `Réparé ${fixedCount} livres sur ${books.length} détectés.`,
            logs
        }
    } catch (error) {
        console.error("Error recovering ratings:", error)
        return { success: false, error: "Erreur lors de la réparation" }
    }
}
