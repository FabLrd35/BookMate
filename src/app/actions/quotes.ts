"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addQuote(bookId: string, content: string, page?: string) {
    await prisma.quote.create({
        data: {
            content,
            page,
            bookId,
        },
    })

    revalidatePath(`/books/${bookId}`)
}

export async function deleteQuote(quoteId: string, bookId: string) {
    await prisma.quote.delete({
        where: { id: quoteId },
    })

    revalidatePath(`/books/${bookId}`)
}

export async function updateQuote(quoteId: string, bookId: string, content: string, page?: string) {
    await prisma.quote.update({
        where: { id: quoteId },
        data: {
            content,
            page,
        },
    })

    revalidatePath(`/books/${bookId}`)
}
