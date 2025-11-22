'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function addWord(data: { text: string; definition?: string; bookId?: string }) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: 'Non authentifié' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé' }
        }
        const word = await prisma.word.create({
            data: {
                text: data.text,
                definition: data.definition,
                bookId: data.bookId,
                userId: user.id,
            },
        })
        revalidatePath('/lexique')
        if (data.bookId) {
            revalidatePath(`/books/${data.bookId}`)
        }
        return { success: true, word }
    } catch (error) {
        console.error('Error adding word:', error)
        return { success: false, error: 'Failed to add word' }
    }
}

export async function getWords() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: 'Non authentifié' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé' }
        }

        const words = await prisma.word.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                book: {
                    select: {
                        title: true,
                    },
                },
            },
        })
        return { success: true, words }
    } catch (error) {
        console.error('Error fetching words:', error)
        return { success: false, error: 'Failed to fetch words' }
    }
}

export async function deleteWord(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: 'Non authentifié' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return { success: false, error: 'Utilisateur non trouvé' }
        }

        const word = await prisma.word.findUnique({
            where: { id },
            select: { userId: true }
        })

        if (!word || word.userId !== user.id) {
            return { success: false, error: 'Mot non trouvé ou accès non autorisé' }
        }

        await prisma.word.delete({
            where: { id },
        })
        revalidatePath('/lexique')
        return { success: true }
    } catch (error) {
        console.error('Error deleting word:', error)
        return { success: false, error: 'Failed to delete word' }
    }
}

export async function fetchDefinition(text: string) {
    try {
        // 1. Search for the term using Wiktionary Search (better than Opensearch for finding relevant pages)
        const searchResponse = await fetch(
            `https://fr.wiktionary.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(text)}&format=json`,
            { headers: { 'User-Agent': 'BookMate/1.0 (contact@example.com)' } }
        )

        if (!searchResponse.ok) {
            return { success: false, error: 'Search failed' }
        }

        const searchData = await searchResponse.json()
        const searchResults = searchData.query?.search || []

        // 2. Iterate through search results to find a valid French definition
        // Prioritize exact match if exists
        const exactMatch = searchResults.find((r: any) => r.title.toLowerCase() === text.toLowerCase())
        const sortedResults = exactMatch
            ? [exactMatch, ...searchResults.filter((r: any) => r.title.toLowerCase() !== text.toLowerCase())]
            : searchResults

        for (const result of sortedResults) {
            const title = result.title

            // Fetch full content for this page
            const pageResponse = await fetch(
                `https://fr.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&explaintext&titles=${encodeURIComponent(title)}&redirects=1`,
                { headers: { 'User-Agent': 'BookMate/1.0 (contact@example.com)' } }
            )

            if (!pageResponse.ok) continue

            const pageData = await pageResponse.json()
            const pages = pageData.query?.pages
            const pageId = Object.keys(pages || {})[0]

            if (!pageId || pageId === '-1') continue

            const extract = pages[pageId].extract
            if (!extract) continue

            // 3. Check for French section
            // Wiktionary pages are divided by language, e.g., "== Français =="
            // Use strict regex to avoid matching === Header === as == Header ==
            const frenchSectionMatch = extract.match(/(?:^|\n)==\s*Français\s*==([\s\S]*?)(?:(?:\n|^)==\s*[A-Z][a-z]+\s*==|$)/)

            if (!frenchSectionMatch) {
                // If no French section, and this isn't the exact word the user typed, skip it.
                // But if it IS the exact word (e.g. user typed a Latin word), maybe we should return it?
                // For now, let's strictly look for French definitions as requested.
                continue
            }

            const frenchContent = frenchSectionMatch[1]
            const lines = frenchContent.split('\n')

            let nounDefinition = ''
            let otherDefinition = ''

            let currentPos = ''

            // Common POS headers
            const posHeaders = [
                '=== Adjectif ===',
                '=== Nom commun ===',
                '=== Verbe ===',
                '=== Adverbe ===',
                '=== Interjection ===',
                '=== Préposition ===',
                '=== Pronom ==='
            ]

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue

                // Check for POS header
                const foundHeader = posHeaders.find(h => line.startsWith(h.replace(/=/g, '').trim()) || line.includes(h.replace(/=/g, '').trim()) || posHeaders.includes(line))
                if (foundHeader) {
                    currentPos = foundHeader
                    continue
                }

                if (currentPos) {
                    // Skip headers
                    if (line.startsWith('=')) continue

                    // Skip exact title match
                    if (line.toLowerCase() === title.toLowerCase()) continue

                    // Skip pronunciation/grammar
                    if (line.includes('\\') || line.includes('/')) continue
                    if (line.toLowerCase().startsWith(title.toLowerCase()) && line.length < 100) continue

                    // Found a potential definition
                    if (currentPos.includes('Nom commun')) {
                        if (!nounDefinition) nounDefinition = line
                    } else {
                        if (!otherDefinition) otherDefinition = line
                    }
                }
            }

            // Prioritize Noun definition
            if (nounDefinition) return { success: true, definition: nounDefinition }
            if (otherDefinition) return { success: true, definition: otherDefinition }
        }

        // 3. Fallback to Wikipedia if Wiktionary fails
        const wikipediaResponse = await fetch(
            `https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(text)}&redirects=1`,
            { headers: { 'User-Agent': 'BookMate/1.0 (contact@example.com)' } }
        )

        if (wikipediaResponse.ok) {
            const data = await wikipediaResponse.json()
            const pages = data.query?.pages
            const pageId = Object.keys(pages || {})[0]

            if (pageId && pageId !== '-1') {
                const extract = pages[pageId].extract
                if (extract) {
                    const definition = extract.split('\n')[0].trim()
                    if (definition) return { success: true, definition }
                }
            }
        }

        return { success: false, error: 'Definition not found' }
    } catch (error) {
        console.error('Error fetching definition:', error)
        return { success: false, error: 'Failed to fetch definition' }
    }
}
