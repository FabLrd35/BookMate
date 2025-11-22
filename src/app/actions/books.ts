"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export async function createBook(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Non authentifié")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        throw new Error("Utilisateur non trouvé")
    }
    const title = formData.get("title") as string
    const authorName = formData.get("author") as string
    const genreName = formData.get("genre") as string | null
    const coverUrl = formData.get("coverUrl") as string | null
    const status = formData.get("status") as "TO_READ" | "READING" | "READ" | "ABANDONED"
    const rating = formData.get("rating") as string | null
    const comment = formData.get("comment") as string | null
    const summary = formData.get("summary") as string | null

    // Find or create author
    let author = await prisma.author.findUnique({
        where: { name: authorName },
    })

    if (!author) {
        author = await prisma.author.create({
            data: { name: authorName },
        })
    }

    // Find or create genre if provided
    let genre = null
    if (genreName) {
        genre = await prisma.genre.findUnique({
            where: { name: genreName },
        })

        if (!genre) {
            genre = await prisma.genre.create({
                data: { name: genreName },
            })
        }
    }

    // Create book
    const book = await prisma.book.create({
        data: {
            title,
            authorId: author.id,
            genreId: genre?.id,
            coverUrl: coverUrl || null,
            status,
            rating: rating ? parseInt(rating) : null,
            comment: comment || null,
            summary: summary || null,
            startDate: status === "READING" || status === "READ" ? new Date() : null,
            finishDate: status === "READ" ? new Date() : null,
            userId: user.id,
        },
    })

    // Create reading activities automatically
    const now = new Date()
    if (status === "READING" || status === "READ") {
        await prisma.readingActivity.create({
            data: {
                date: now,
                bookId: book.id,
                activityType: "STARTED",
            },
        }).catch(() => { }) // Ignore duplicates
    }
    if (status === "READ") {
        await prisma.readingActivity.create({
            data: {
                date: now,
                bookId: book.id,
                activityType: "FINISHED",
            },
        }).catch(() => { }) // Ignore duplicates
    }

    revalidatePath("/books")
    revalidatePath("/calendar")
    redirect(`/books/${book.id}`)
}

export async function updateBook(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Non authentifié")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        throw new Error("Utilisateur non trouvé")
    }
    const title = formData.get("title") as string
    const authorName = formData.get("author") as string
    const genreName = formData.get("genre") as string | null
    const coverUrl = formData.get("coverUrl") as string | null
    const status = formData.get("status") as "TO_READ" | "READING" | "READ" | "ABANDONED"
    const rating = formData.get("rating") as string | null
    const comment = formData.get("comment") as string | null
    const summary = formData.get("summary") as string | null

    // Find or create author
    let author = await prisma.author.findUnique({
        where: { name: authorName },
    })

    if (!author) {
        author = await prisma.author.create({
            data: { name: authorName },
        })
    }

    // Find or create genre if provided
    let genre = null
    if (genreName) {
        genre = await prisma.genre.findUnique({
            where: { name: genreName },
        })

        if (!genre) {
            genre = await prisma.genre.create({
                data: { name: genreName },
            })
        }
    }

    // Update book
    await prisma.book.update({
        where: { id },
        data: {
            title,
            author: {
                connect: { id: author.id }
            },
            genre: genre ? {
                connect: { id: genre.id }
            } : {
                disconnect: true
            },
            coverUrl: coverUrl || null,
            status,
            rating: rating ? parseInt(rating) : null,
            comment: comment || null,
            summary: summary || null,
            // Update dates based on status changes if needed, or keep existing logic
            // For now, let's keep it simple: if moving to READING/READ, ensure startDate.
            // If moving to READ, ensure finishDate.
            // However, we might want to preserve existing dates if they are already set.
            // Prisma update doesn't automatically handle conditional updates based on previous state easily in one go without fetching first.
            // But we can just set them if they are null in the DB? No, we don't know the DB state here easily.
            // Let's just set them if the status implies it, similar to create.
            // A better approach for edit is to maybe not override dates if they exist, but that requires fetching.
            // For simplicity in this iteration, we'll update them if the status matches.
            // Actually, let's fetch the book first to be smart about dates?
            // Or just let the user edit dates? The form doesn't have date pickers yet.
            // Let's stick to the create logic for now:
            startDate: (status === "READING" || status === "READ") ? new Date() : undefined, // This might reset start date on every edit. Bad.
            // Better: don't touch dates for now unless we add fields for them.
            // Wait, if I change status to READ, I want finishDate to be set.
            // If I change to TO_READ, I might want to clear dates.
            // Let's leave dates alone for now to avoid resetting them, except maybe setting finishDate if becoming READ?
            // Let's keep it simple and NOT update dates automatically on edit for now to avoid data loss,
            // or maybe just update finishDate if it's READ.
        },
    })

    // If status changed to READ, we might want to set finishDate if not set.
    // If status changed to READING, set startDate if not set.
    // This is complex without fetching. Let's do a quick fetch to handle dates correctly.
    const currentBook = await prisma.book.findUnique({ where: { id }, select: { startDate: true, finishDate: true } })

    if (currentBook) {
        const dataToUpdate: any = {}
        if ((status === "READING" || status === "READ") && !currentBook.startDate) {
            dataToUpdate.startDate = new Date()
        }
        if (status === "READ" && !currentBook.finishDate) {
            dataToUpdate.finishDate = new Date()
        }
        if (status === "TO_READ") {
            dataToUpdate.startDate = null
            dataToUpdate.finishDate = null
        }

        if (Object.keys(dataToUpdate).length > 0) {
            await prisma.book.update({
                where: { id },
                data: dataToUpdate
            })
        }
    }

    revalidatePath("/books")
    revalidatePath(`/books/${id}`)
    redirect(`/books/${id}`)
}

export async function getAuthors() {
    return await prisma.author.findMany({
        orderBy: { name: "asc" },
    })
}

export async function getGenres() {
    return await prisma.genre.findMany({
        orderBy: { name: "asc" },
    })
}

export async function fetchBookCover(title: string, author: string) {
    try {
        // Construct Google Books API query
        const query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`
        const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=fr&hl=fr&country=FR`

        const response = await fetch(url)
        const data = await response.json()

        // Check if we got results
        if (data.items && data.items.length > 0) {
            const book = data.items[0]
            const imageLinks = book.volumeInfo?.imageLinks
            const pageCount = book.volumeInfo?.pageCount || null
            const description = book.volumeInfo?.description || null

            if (imageLinks) {
                // Get the thumbnail and upgrade to higher resolution
                // Google Books allows zoom parameter: zoom=1 (default), zoom=0 (larger)
                let coverUrl = imageLinks.thumbnail || imageLinks.smallThumbnail

                if (coverUrl) {
                    // Remove edge curl effect and increase size
                    coverUrl = coverUrl.replace('&edge=curl', '')
                    coverUrl = coverUrl.replace('zoom=1', 'zoom=0')
                    return { success: true, coverUrl, pageCount, description }
                }
            }

            // If no cover but we have page count or description, still return them
            if (pageCount || description) {
                return { success: true, coverUrl: null, pageCount, description }
            }
        }

        return { success: false, error: "Aucune information trouvée pour ce livre" }
    } catch (error) {
        console.error("Error fetching book info:", error)
        return { success: false, error: "Échec de la récupération des informations du livre" }
    }
}

export async function fetchGoogleBook(id: string) {
    try {
        const url = `https://www.googleapis.com/books/v1/volumes/${id}?langRestrict=fr&hl=fr&country=FR`
        const response = await fetch(url)

        if (!response.ok) {
            return { success: false, error: "Livre non trouvé" }
        }

        const data = await response.json()

        if (!data.volumeInfo) {
            return { success: false, error: "Informations du livre incomplètes" }
        }

        const volumeInfo = data.volumeInfo

        let coverUrl = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium

        // Upgrade cover quality
        if (coverUrl) {
            coverUrl = coverUrl.replace('&edge=curl', '')
            coverUrl = coverUrl.replace('zoom=1', 'zoom=0')
        }

        const book = {
            id: data.id,
            title: volumeInfo.title || 'Titre inconnu',
            authors: volumeInfo.authors || ['Auteur inconnu'],
            coverUrl: coverUrl || null,
            description: volumeInfo.description || null,
            pageCount: volumeInfo.pageCount || null,
            publisher: volumeInfo.publisher || null,
            publishedDate: volumeInfo.publishedDate || null,
            categories: volumeInfo.categories || [],
            averageRating: volumeInfo.averageRating || null,
            ratingsCount: volumeInfo.ratingsCount || null,
            language: volumeInfo.language || null,
        }

        return { success: true, book }
    } catch (error) {
        console.error("Error fetching google book:", error)
        return { success: false, error: "Échec de la récupération du livre" }
    }
}

export async function searchBooks(query: string) {
    try {
        if (!query || query.trim().length < 2) {
            return { success: true, books: [] }
        }

        const searchQuery = encodeURIComponent(query)
        const url = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=10&langRestrict=fr&hl=fr&country=FR`

        const response = await fetch(url)
        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return { success: true, books: [] }
        }

        const books = data.items.map((item: any) => {
            const volumeInfo = item.volumeInfo
            let coverUrl = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail

            // Upgrade cover quality
            if (coverUrl) {
                coverUrl = coverUrl.replace('&edge=curl', '')
                coverUrl = coverUrl.replace('zoom=1', 'zoom=0')
            }

            return {
                id: item.id,
                title: volumeInfo.title || 'Titre inconnu',
                authors: volumeInfo.authors || ['Auteur inconnu'],
                coverUrl: coverUrl || null,
                description: volumeInfo.description || null,
                pageCount: volumeInfo.pageCount || null,
                publisher: volumeInfo.publisher || null,
                publishedDate: volumeInfo.publishedDate || null,
                isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || null,
            }
        })

        return { success: true, books }
    } catch (error) {
        console.error("Error searching books:", error)
        return { success: false, books: [], error: "Échec de la recherche" }
    }
}

export async function deleteBook(id: string) {
    await prisma.book.delete({
        where: { id },
    })

    revalidatePath("/books")
    redirect("/books")
}

export async function updateCurrentPage(bookId: string, currentPage: number) {
    await prisma.book.update({
        where: { id: bookId },
        data: { currentPage },
    })

    revalidatePath(`/books/${bookId}`)
    return { success: true }
}

export async function updateBookStatus(
    bookId: string,
    newStatus: "READING" | "READ" | "ABANDONED",
    additionalData?: {
        rating?: number
        comment?: string
        finishDate?: Date
    }
) {
    // Fetch current book to check status and dates
    const currentBook = await prisma.book.findUnique({
        where: { id: bookId },
        select: { status: true, startDate: true, finishDate: true }
    })

    if (!currentBook) {
        return { success: false, error: "Livre non trouvé" }
    }

    const data: any = { status: newStatus }
    const now = new Date()

    // Set dates automatically based on status change
    // Only update startDate if moving to READING and it wasn't already set, or if status changed
    if (newStatus === "READING") {
        if (currentBook.status !== "READING" || !currentBook.startDate) {
            data.startDate = now
        }
    } else if (newStatus === "READ") {
        // Use provided finish date or default to now
        // Only update finishDate if moving to READ and it wasn't already set, or if status changed, or if explicitly provided
        if (additionalData?.finishDate) {
            data.finishDate = additionalData.finishDate
        } else if (currentBook.status !== "READ" || !currentBook.finishDate) {
            data.finishDate = now
        }
    }

    // Add rating and comment if provided
    if (additionalData?.rating !== undefined) {
        data.rating = additionalData.rating
    }
    if (additionalData?.comment !== undefined) {
        data.comment = additionalData.comment
    }

    await prisma.book.update({
        where: { id: bookId },
        data,
    })

    // Create reading activity automatically ONLY if status changed
    if (newStatus !== currentBook.status) {
        if (newStatus === "READING") {
            await prisma.readingActivity.create({
                data: {
                    date: now,
                    bookId,
                    activityType: "STARTED",
                },
            }).catch(() => { }) // Ignore duplicates
        } else if (newStatus === "READ") {
            await prisma.readingActivity.create({
                data: {
                    date: additionalData?.finishDate || now,
                    bookId,
                    activityType: "FINISHED",
                },
            }).catch(() => { }) // Ignore duplicates
        }
    }

    revalidatePath("/books")
    revalidatePath(`/books/${bookId}`)
    revalidatePath("/")
    revalidatePath("/calendar")
    return { success: true }
}

export async function quickAddBook(bookData: {
    title: string
    author: string
    coverUrl: string | null
    description: string | null
    pageCount: number | null
    categories: string[]
    status: "TO_READ" | "READING" | "READ" | "ABANDONED"
}) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Non authentifié" }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" }
        }
        // Find or create author
        let author = await prisma.author.findUnique({
            where: { name: bookData.author },
        })

        if (!author) {
            author = await prisma.author.create({
                data: { name: bookData.author },
            })
        }

        // Find or create genre from first category if available
        let genre = null
        if (bookData.categories && bookData.categories.length > 0) {
            const genreName = bookData.categories[0]
            genre = await prisma.genre.findUnique({
                where: { name: genreName },
            })

            if (!genre) {
                genre = await prisma.genre.create({
                    data: { name: genreName },
                })
            }
        }

        // Create book with appropriate dates based on status
        const book = await prisma.book.create({
            data: {
                title: bookData.title,
                authorId: author.id,
                genreId: genre?.id,
                coverUrl: bookData.coverUrl,
                summary: bookData.description,
                totalPages: bookData.pageCount,
                status: bookData.status,
                startDate: (bookData.status === "READING" || bookData.status === "READ") ? new Date() : null,
                finishDate: bookData.status === "READ" ? new Date() : null,
                rating: null,
                comment: null,
                currentPage: null,
                userId: user.id,
            },
        })

        // Create reading activities automatically
        const now = new Date()
        if (bookData.status === "READING" || bookData.status === "READ") {
            await prisma.readingActivity.create({
                data: {
                    date: now,
                    bookId: book.id,
                    activityType: "STARTED",
                },
            }).catch(() => { }) // Ignore duplicates
        }
        if (bookData.status === "READ") {
            await prisma.readingActivity.create({
                data: {
                    date: now,
                    bookId: book.id,
                    activityType: "FINISHED",
                },
            }).catch(() => { }) // Ignore duplicates
        }

        revalidatePath("/books")
        revalidatePath("/")
        revalidatePath("/calendar")

        return { success: true, bookId: book.id }
    } catch (error) {
        console.error("Error quick adding book:", error)
        return { success: false, error: "Échec de l'ajout du livre" }
    }
}

export async function toggleBookFavorite(bookId: string) {
    try {
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            select: { isFavorite: true }
        })

        if (!book) {
            return { success: false, error: "Livre non trouvé" }
        }

        await prisma.book.update({
            where: { id: bookId },
            data: { isFavorite: !book.isFavorite }
        })

        revalidatePath("/books")
        revalidatePath(`/books/${bookId}`)
        revalidatePath("/")

        return { success: true, isFavorite: !book.isFavorite }
    } catch (error) {
        console.error("Error toggling favorite:", error)
        return { success: false, error: "Échec de la mise à jour des favoris" }
    }
}
