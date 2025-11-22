"use server"

import { z } from "zod"

const GoogleBookSchema = z.object({
    items: z.array(z.object({
        volumeInfo: z.object({
            title: z.string(),
            authors: z.array(z.string()).optional(),
            categories: z.array(z.string()).optional(),
            pageCount: z.number().optional(),
            imageLinks: z.object({
                thumbnail: z.string().optional(),
            }).optional(),
            publishedDate: z.string().optional(),
        }),
    })).optional(),
})

export async function fetchBookByISBN(isbn: string) {
    try {
        const cleanISBN = isbn.replace(/[-\s]/g, '')
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}&langRestrict=fr&hl=fr&country=FR`,
            { cache: 'no-store' }
        )

        if (!response.ok) {
            return { success: false, error: "Erreur lors de la recherche" }
        }

        const data = await response.json()
        const parsed = GoogleBookSchema.safeParse(data)

        if (!parsed.success || !parsed.data.items || parsed.data.items.length === 0) {
            return { success: false, error: "Livre non trouvé" }
        }

        const book = parsed.data.items[0].volumeInfo

        return {
            success: true,
            book: {
                title: book.title,
                author: book.authors?.[0] || "",
                genre: book.categories?.[0] || "",
                coverUrl: book.imageLinks?.thumbnail?.replace("http://", "https://") || "",
                totalPages: book.pageCount || null,
                publishedDate: book.publishedDate || null,
            },
        }
    } catch (error) {
        console.error("Error fetching book by ISBN:", error)
        return { success: false, error: "Erreur lors de la recherche" }
    }
}
