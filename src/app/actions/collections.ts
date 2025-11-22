"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export async function createCollection(name: string, description?: string, bookId?: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return

    await prisma.collection.create({
        data: {
            name,
            description,
            userId: user.id,
            books: bookId ? {
                connect: { id: bookId }
            } : undefined
        },
    })

    if (bookId) {
        revalidatePath(`/books/${bookId}`)
    }
    revalidatePath("/collections")
}

export async function deleteCollection(id: string) {
    await prisma.collection.delete({
        where: { id },
    })
    revalidatePath("/collections")
}

export async function addBookToCollection(collectionId: string, bookId: string) {
    await prisma.collection.update({
        where: { id: collectionId },
        data: {
            books: {
                connect: { id: bookId },
            },
        },
    })
    revalidatePath(`/books/${bookId}`)
    revalidatePath(`/collections/${collectionId}`)
}

export async function addMultipleBooksToCollection(collectionId: string, bookIds: string[]) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return

    // Verify ownership
    const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
    })

    if (!collection || collection.userId !== user.id) return

    await prisma.collection.update({
        where: { id: collectionId },
        data: {
            books: {
                connect: bookIds.map(id => ({ id })),
            },
        },
    })

    revalidatePath(`/collections/${collectionId}`)
    bookIds.forEach(id => revalidatePath(`/books/${id}`))
}

export async function removeBookFromCollection(collectionId: string, bookId: string) {
    await prisma.collection.update({
        where: { id: collectionId },
        data: {
            books: {
                disconnect: { id: bookId },
            },
        },
    })
    revalidatePath(`/books/${bookId}`)
    revalidatePath(`/collections/${collectionId}`)
}

export async function getCollections() {
    const session = await auth()
    if (!session?.user?.email) return []

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return []

    return await prisma.collection.findMany({
        where: { userId: user.id },
        include: {
            _count: {
                select: { books: true },
            },
            books: {
                take: 5,
                select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}
