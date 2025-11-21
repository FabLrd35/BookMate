"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCollection(name: string, description?: string) {
    await prisma.collection.create({
        data: {
            name,
            description,
        },
    })
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
    return await prisma.collection.findMany({
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
