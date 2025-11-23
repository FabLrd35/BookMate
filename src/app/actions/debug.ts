"use server"

/**
 * 🔬 DEBUG ENDPOINT - Test parseFloat behavior in production
 * 
 * This function tests if parseFloat works correctly in the production environment.
 * Call this from a test page to verify the runtime behavior.
 */
export async function debugParseFloat() {
    const testCases = [
        "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"
    ]

    const results = testCases.map(input => {
        const parsed = parseFloat(input)
        return {
            input,
            parsed,
            typeof: typeof parsed,
            isNaN: isNaN(parsed),
            isMinValue: parsed === Number.MIN_VALUE,
            multipliedByMinValue: parseFloat(input) * Number.MIN_VALUE,
            dividedByMaxValue: parseFloat(input) / Number.MAX_VALUE,
        }
    })

    const environment = {
        runtime: typeof (globalThis as any).EdgeRuntime !== 'undefined' ? 'edge' : 'nodejs',
        nodeVersion: process.version || 'unknown',
        platform: process.platform || 'unknown',
        vercelRegion: process.env.VERCEL_REGION || 'local',
        vercelEnv: process.env.VERCEL_ENV || 'development',
        numberMinValue: Number.MIN_VALUE,
        numberMaxValue: Number.MAX_VALUE,
    }

    console.log("🔬 [debugParseFloat] Environment:", environment)
    console.log("🔬 [debugParseFloat] Test results:", results)

    return {
        environment,
        results,
        timestamp: new Date().toISOString(),
    }
}

/**
 * 🔬 DEBUG ENDPOINT - Test database write/read cycle
 * 
 * This creates a test book with a known rating, then reads it back
 * to see if the value is corrupted during the database round-trip.
 */
export async function debugDatabaseRating(testRating: number = 3) {
    const { prisma } = await import("@/lib/prisma")
    const { auth } = await import("@/auth")

    const session = await auth()
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return { success: false, error: "User not found" }
    }

    // Find or create a test author
    let author = await prisma.author.findUnique({
        where: { name: "DEBUG_TEST_AUTHOR" },
    })

    if (!author) {
        author = await prisma.author.create({
            data: { name: "DEBUG_TEST_AUTHOR" },
        })
    }

    console.log("🔬 [debugDatabaseRating] Input rating:", testRating)
    console.log("🔬 [debugDatabaseRating] typeof testRating:", typeof testRating)

    // Create test book
    const book = await prisma.book.create({
        data: {
            title: `DEBUG_TEST_BOOK_${Date.now()}`,
            authorId: author.id,
            status: "READ",
            rating: testRating,
            userId: user.id,
        },
    })

    console.log("🔬 [debugDatabaseRating] Created book.rating:", book.rating)
    console.log("🔬 [debugDatabaseRating] typeof book.rating:", typeof book.rating)

    // Read it back
    const readBook = await prisma.book.findUnique({
        where: { id: book.id },
        select: { id: true, title: true, rating: true },
    })

    console.log("🔬 [debugDatabaseRating] Read back rating:", readBook?.rating)
    console.log("🔬 [debugDatabaseRating] typeof read rating:", typeof readBook?.rating)

    // Clean up
    await prisma.book.delete({ where: { id: book.id } })

    return {
        success: true,
        input: {
            value: testRating,
            type: typeof testRating,
        },
        created: {
            value: book.rating,
            type: typeof book.rating,
        },
        readBack: {
            value: readBook?.rating,
            type: typeof readBook?.rating,
        },
        isCorrupted: book.rating !== testRating || readBook?.rating !== testRating,
        corruptionPoint:
            book.rating !== testRating ? "database_write" :
                readBook?.rating !== testRating ? "database_read" :
                    "none",
    }
}
