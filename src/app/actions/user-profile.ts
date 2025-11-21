"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function updateUserImage(userId: string, formData: FormData, type: 'avatar' | 'banner') {
    try {
        const file = formData.get("file") as File

        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `user-${userId}-${type}-${uniqueSuffix}.jpg` // Force jpg extension for simplicity or keep original

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "users")
        await mkdir(uploadDir, { recursive: true })

        // Save file
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const imageUrl = `/uploads/users/${filename}`

        // Update user in database
        await prisma.user.update({
            where: { id: userId },
            data: {
                [type === 'avatar' ? 'image' : 'bannerUrl']: imageUrl
            }
        })

        revalidatePath("/profile")
        return { success: true, imageUrl }
    } catch (error) {
        console.error(`Error updating user ${type}:`, error)
        return { success: false, error: `Failed to update ${type}` }
    }
}
