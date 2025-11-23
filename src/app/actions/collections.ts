"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import type { Collection } from "@prisma/client"

export async function createCollection(
    name: string,
    description?: string,
    bookId?: string
): Promise<Collection | null> {
    const session = await auth()
    if (!session?.user?.email) return null

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return null

    // ✅ on crée la collection
    const collection = await prisma.collection.create({
        data: {
            name,
            description,
            userId: user.id,

            // ✅ auto-ajout du livre UNIQUEMENT si bookId fourni
            books: bookId
                ? {
                    connect: { id: bookId },
                }
                : undefined,
        },
    })

    if (bookId) {
        revalidatePath(`/books/${bookId}`)
    }
    revalidatePath("/collections")

    // ✅ IMPORTANT : on retourne l'objet créé
    return collection
}

export async function deleteCollection(id: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return

    // ✅ sécurité: vérifier que la collection appartient à l'user
    const collection = await prisma.collection.findUnique({ where: { id } })
    if (!collection || collection.userId !== user.id) return

    await prisma.collection.delete({
        where: { id },
    })

    revalidatePath("/collections")
}

export async function addBookToCollection(collectionId: string, bookId: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return

    const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
    })
    if (!collection || collection.userId !== user.id) return

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

    const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
    })
    if (!collection || collection.userId !== user.id) return

    await prisma.collection.update({
        where: { id: collectionId },
        data: {
            books: {
                connect: bookIds.map((id) => ({ id })),
            },
        },
    })

    revalidatePath(`/collections/${collectionId}`)
    bookIds.forEach((id) => revalidatePath(`/books/${id}`))
}

export async function removeBookFromCollection(collectionId: string, bookId: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return

    const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
    })
    if (!collection || collection.userId !== user.id) return

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

export async function updateBookCollections(
    bookId: string,
    collectionIdsToAdd: string[],
    collectionIdsToRemove: string[]
) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })
    if (!user) return

    // Vérifier que toutes les collections appartiennent à l'utilisateur
    const collections = await prisma.collection.findMany({
        where: {
            id: { in: [...collectionIdsToAdd, ...collectionIdsToRemove] },
        },
    })

    // Filtrer pour ne garder que les collections de l'utilisateur
    const userCollectionIds = new Set(
        collections.filter(c => c.userId === user.id).map(c => c.id)
    )

    const validIdsToAdd = collectionIdsToAdd.filter(id => userCollectionIds.has(id))
    const validIdsToRemove = collectionIdsToRemove.filter(id => userCollectionIds.has(id))

    // Ajouter le livre aux collections
    if (validIdsToAdd.length > 0) {
        await Promise.all(
            validIdsToAdd.map(collectionId =>
                prisma.collection.update({
                    where: { id: collectionId },
                    data: {
                        books: {
                            connect: { id: bookId },
                        },
                    },
                })
            )
        )
    }

    // Retirer le livre des collections
    if (validIdsToRemove.length > 0) {
        await Promise.all(
            validIdsToRemove.map(collectionId =>
                prisma.collection.update({
                    where: { id: collectionId },
                    data: {
                        books: {
                            disconnect: { id: bookId },
                        },
                    },
                })
            )
        )
    }

    // Revalider les chemins
    revalidatePath(`/books/${bookId}`)
        ;[...validIdsToAdd, ...validIdsToRemove].forEach(id => {
            revalidatePath(`/collections/${id}`)
        })
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
