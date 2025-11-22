"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function addQuote(bookId: string, content: string, page?: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return

    await prisma.quote.create({
        data: {
            content,
            page,
            bookId,
            userId: user.id,
        },
    })

    revalidatePath(`/books/${bookId}`)
}

export async function deleteQuote(quoteId: string, bookId: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return

    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        select: { userId: true }
    })

    if (!quote || quote.userId !== user.id) return

    await prisma.quote.delete({
        where: { id: quoteId },
    })

    revalidatePath(`/books/${bookId}`)
}

export async function updateQuote(quoteId: string, bookId: string, content: string, page?: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) return

    const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        select: { userId: true }
    })

    if (!quote || quote.userId !== user.id) return

    await prisma.quote.update({
        where: { id: quoteId },
        data: {
            content,
            page,
        },
    })

    revalidatePath(`/books/${bookId}`)
}
