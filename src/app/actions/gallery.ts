"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getGlobalGallery() {
    const session = await auth()
    if (!session?.user?.email) {
        return []
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return []
    }

    const images = await prisma.bookImage.findMany({
        where: {
            book: {
                userId: user.id
            }
        },
        include: {
            book: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return images
}
