"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function fetchAuthorPhoto(authorId: string, authorName: string) {
    try {
        // Use Wikipedia API to search for the author
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(authorName)}&pithumbsize=400&origin=*`

        const response = await fetch(searchUrl)
        const data = await response.json()

        if (data.query && data.query.pages) {
            const pages = data.query.pages
            const pageId = Object.keys(pages)[0]

            if (pageId !== "-1" && pages[pageId].thumbnail) {
                const photoUrl = pages[pageId].thumbnail.source

                // Update author with photo URL
                await prisma.author.update({
                    where: { id: authorId },
                    data: { photoUrl },
                })

                revalidatePath("/authors")
                revalidatePath(`/authors/${authorId}`)

                return { success: true, photoUrl }
            }
        }

        return { success: false, error: "Aucune photo trouvée pour cet auteur" }
    } catch (error) {
        console.error("Error fetching author photo:", error)
        return { success: false, error: "Échec de la récupération de la photo" }
    }
}
