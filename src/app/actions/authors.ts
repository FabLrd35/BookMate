"use server"

import { prisma } from "@/lib/prisma"

import { auth } from "@/auth"

export async function getAuthorsWithStats() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return []

    const authors = await prisma.author.findMany({
        where: {
            books: {
                some: {
                    userId: user.id
                }
            }
        },
        include: {
            books: {
                where: {
                    userId: user.id
                },
                select: {
                    id: true,
                    status: true,
                    rating: true,
                },
            },
        },
    })

    // Calculate statistics for each author and fetch photos if missing
    const authorsWithStats = await Promise.all(authors.map(async (author) => {
        const totalBooks = author.books.length
        const readBooks = author.books.filter(book => book.status === "READ")
        const booksRead = readBooks.length

        // Calculate average rating
        const ratingsSum = readBooks.reduce((sum, book) => {
            return sum + (book.rating ? Number(book.rating) : 0)
        }, 0)
        const averageRating = booksRead > 0 ? ratingsSum / booksRead : 0

        // Fetch photo if not already present
        let photoUrl = author.photoUrl
        if (!photoUrl) {
            try {
                // Try direct page lookup first
                let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(author.name)}&pithumbsize=400&origin=*`
                let response = await fetch(searchUrl)
                let data = await response.json()

                let found = false
                if (data.query && data.query.pages) {
                    const pages = data.query.pages
                    const pageId = Object.keys(pages)[0]

                    if (pageId !== "-1" && pages[pageId].thumbnail) {
                        photoUrl = pages[pageId].thumbnail.source
                        found = true
                    }
                }

                // If not found, try search API
                if (!found) {
                    searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(author.name)}&srlimit=1&origin=*`
                    response = await fetch(searchUrl)
                    data = await response.json()

                    if (data.query && data.query.search && data.query.search.length > 0) {
                        const pageTitle = data.query.search[0].title

                        // Get image for the found page
                        searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(pageTitle)}&pithumbsize=400&origin=*`
                        response = await fetch(searchUrl)
                        data = await response.json()

                        if (data.query && data.query.pages) {
                            const pages = data.query.pages
                            const pageId = Object.keys(pages)[0]

                            if (pageId !== "-1" && pages[pageId].thumbnail) {
                                photoUrl = pages[pageId].thumbnail.source
                                found = true
                            }
                        }
                    }
                }

                // Update author with photo URL if found
                if (found && photoUrl) {
                    await prisma.author.update({
                        where: { id: author.id },
                        data: { photoUrl },
                    })
                }
            } catch (error) {
                console.error(`Error fetching photo for ${author.name}:`, error)
            }
        }

        return {
            id: author.id,
            name: author.name,
            photoUrl,
            totalBooks,
            booksRead,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        }
    }))

    // Sort by total books (descending)
    return authorsWithStats.sort((a, b) => b.totalBooks - a.totalBooks)
}

export async function getAuthorById(id: string) {
    const session = await auth()
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return null

    const author = await prisma.author.findUnique({
        where: { id },
        include: {
            books: {
                where: { userId: user.id },
                include: {
                    author: true,
                    genre: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    })

    if (!author) {
        return null
    }

    // Fetch photo if not already present
    if (!author.photoUrl) {
        try {
            // Try direct page lookup first
            let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(author.name)}&pithumbsize=400&origin=*`
            let response = await fetch(searchUrl)
            let data = await response.json()

            let photoUrl = null
            if (data.query && data.query.pages) {
                const pages = data.query.pages
                const pageId = Object.keys(pages)[0]

                if (pageId !== "-1" && pages[pageId].thumbnail) {
                    photoUrl = pages[pageId].thumbnail.source
                }
            }

            // If not found, try search API
            if (!photoUrl) {
                searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(author.name)}&srlimit=1&origin=*`
                response = await fetch(searchUrl)
                data = await response.json()

                if (data.query && data.query.search && data.query.search.length > 0) {
                    const pageTitle = data.query.search[0].title

                    // Get image for the found page
                    searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(pageTitle)}&pithumbsize=400&origin=*`
                    response = await fetch(searchUrl)
                    data = await response.json()

                    if (data.query && data.query.pages) {
                        const pages = data.query.pages
                        const pageId = Object.keys(pages)[0]

                        if (pageId !== "-1" && pages[pageId].thumbnail) {
                            photoUrl = pages[pageId].thumbnail.source
                        }
                    }
                }
            }

            // Update author with photo URL if found
            if (photoUrl) {
                await prisma.author.update({
                    where: { id },
                    data: { photoUrl },
                })

                // Return updated author
                return { ...author, photoUrl }
            }
        } catch (error) {
            console.error(`Error fetching photo for ${author.name}:`, error)
        }
    }

    return author
}

export async function discoverAuthorBooks(authorName: string, authorId: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, books: [], error: "Non authentifié" }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })
        if (!user) return { success: false, books: [], error: "Utilisateur non trouvé" }

        // Get books already in the user's library for this author
        const existingBooks = await prisma.book.findMany({
            where: {
                authorId,
                userId: user.id
            },
            select: { title: true },
        })

        const existingTitles = new Set(
            existingBooks.map(book => book.title.toLowerCase().trim())
        )

        // Search Google Books API for this author
        const query = `inauthor:${encodeURIComponent(authorName)}`
        const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20&orderBy=relevance&langRestrict=fr&hl=fr&country=FR`

        const response = await fetch(url, { cache: 'no-store' })
        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return { success: true, books: [] }
        }

        // Filter and format books
        const discoveredBooks = data.items
            .map((item: any) => {
                const volumeInfo = item.volumeInfo
                let coverUrl = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail

                // Upgrade cover quality
                if (coverUrl) {
                    coverUrl = coverUrl.replace('&edge=curl', '')
                    coverUrl = coverUrl.replace('zoom=1', 'zoom=0')
                    // Force HTTPS to avoid Vercel image optimization errors
                    coverUrl = coverUrl.replace('http://', 'https://')
                }

                return {
                    id: item.id,
                    title: volumeInfo.title || 'Unknown Title',
                    authors: volumeInfo.authors || [authorName],
                    coverUrl: coverUrl || null,
                    description: volumeInfo.description || null,
                }
            })
            // Filter out books already in library (case-insensitive comparison)
            .filter((book: any) => !existingTitles.has(book.title.toLowerCase().trim()))
            // Limit to 6 suggestions
            .slice(0, 6)

        return { success: true, books: discoveredBooks }
    } catch (error) {
        console.error("Error discovering author books:", error)
        return { success: false, books: [], error: "Échec de la recherche de livres" }
    }
}
