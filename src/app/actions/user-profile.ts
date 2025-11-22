"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"

export async function updateUserImage(userId: string, formData: FormData, type: 'avatar' | 'banner') {
    try {
        const file = formData.get("file") as File

        if (!file || file.size === 0) {
            return { success: false, error: "No file provided" }
        }

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `user-${userId}-${type}-${uniqueSuffix}.jpg`

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
        })

        // Update user in database
        await prisma.user.update({
            where: { id: userId },
            data: {
                [type === 'avatar' ? 'image' : 'bannerUrl']: blob.url
            }
        })

        revalidatePath("/profile")
        return { success: true, imageUrl: blob.url }
    } catch (error) {
        console.error(`Error updating user ${type}:`, error)
        return {
            success: false,
            error: error instanceof Error ? error.message : `Failed to update ${type}`
        }
    }
}
