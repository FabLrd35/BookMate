"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { GoalPeriod } from "@prisma/client"
import { auth } from "@/auth"

export async function getReadingGoal(period: GoalPeriod, year: number, month?: number) {
    const session = await auth()
    if (!session?.user?.email) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return null
    }

    const goal = await prisma.readingGoal.findFirst({
        where: {
            year,
            month: period === "MONTHLY" ? month! : null,
            period,
            userId: user.id,
        },
    })
    return goal
}

export async function setReadingGoal(period: GoalPeriod, year: number, target: number, month?: number) {
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

    const monthValue = period === "MONTHLY" ? month! : null

    // Check if goal exists
    const existingGoal = await prisma.readingGoal.findFirst({
        where: {
            year,
            month: monthValue,
            period,
            userId: user.id,
        },
    })

    if (existingGoal) {
        // Update existing goal
        await prisma.readingGoal.update({
            where: { id: existingGoal.id },
            data: { target },
        })
    } else {
        // Create new goal
        await prisma.readingGoal.create({
            data: {
                year,
                month: monthValue,
                period,
                target,
                userId: user.id,
            },
        })
    }

    revalidatePath("/")
}
