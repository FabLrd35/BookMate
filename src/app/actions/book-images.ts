"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export async function addBookImage(formData: FormData) {
    try {
        const bookId = formData.get("bookId") as string
        const caption = formData.get("caption") as string | null
        const file = formData.get("file") as File
        const urlInput = formData.get("url") as string | null

        if (!bookId) {
            return { success: false, error: "Book ID is required" }
        }

        let imageUrl = urlInput

        // Handle file upload if present
        if (file && file.size > 0) {
            // Create unique filename
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            const filename = `book-${bookId}-${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

            // Upload to Vercel Blob
            const blob = await put(filename, file, {
                access: 'public',
            })

            imageUrl = blob.url
        }

        if (!imageUrl) {
            return { success: false, error: "No image provided" }
        }

        const image = await prisma.bookImage.create({
            data: {
                bookId,
                url: imageUrl,
                caption,
            },
        })

        revalidatePath(`/books/${bookId}`)
        return { success: true, image }
    } catch (error) {
        console.error("Error adding book image:", error)
        return { success: false, error: "Failed to add image" }
    }
}

export async function deleteBookImage(imageId: string, bookId: string) {
    try {
        // Note: We could also delete the file from disk here if we wanted to be thorough,
        // but for now we'll just remove the DB entry.
        await prisma.bookImage.delete({
            where: {
                id: imageId,
            },
        })

        revalidatePath(`/books/${bookId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deleting book image:", error)
        return { success: false, error: "Failed to delete image" }
    }
}
