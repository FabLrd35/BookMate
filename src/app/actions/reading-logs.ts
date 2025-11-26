"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleReadingLog(date: Date) {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, error: "Not authenticated" }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) return { success: false, error: "User not found" }

        // Normalize date to midnight UTC or local?
        // We want to store the date representing the day.
        // The input date should be set to midnight.
        const normalizedDate = new Date(date)
        normalizedDate.setHours(0, 0, 0, 0)

        const existing = await prisma.readingLog.findUnique({
            where: {
                date_userId: {
                    date: normalizedDate,
                    userId: user.id
                }
            }
        })

        if (existing) {
            await prisma.readingLog.delete({
                where: { id: existing.id }
            })
            revalidatePath("/calendar")
            return { success: true, status: "removed" }
        } else {
            await prisma.readingLog.create({
                data: {
                    date: normalizedDate,
                    userId: user.id
                }
            })
            revalidatePath("/calendar")
            return { success: true, status: "added" }
        }
    } catch (error) {
        console.error("Error toggling reading log:", error)
        return { success: false, error: "Failed to toggle log" }
    }
}

export async function getReadingLogs(year: number) {
    try {
        const session = await auth()
        if (!session?.user?.email) return { success: false, logs: [] }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) return { success: false, logs: [] }

        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59)

        const logs = await prisma.readingLog.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: { date: true }
        })

        return { success: true, logs: logs.map(l => l.date) }
    } catch (error) {
        console.error("Error fetching reading logs:", error)
        return { success: false, logs: [] }
    }
}
