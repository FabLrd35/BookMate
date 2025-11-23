"use server"

import { put } from "@vercel/blob"

export async function uploadCoverImage(file: File): Promise<string | null> {
    try {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `cover-${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

        const blob = await put(filename, file, {
            access: 'public',
        })

        return blob.url
    } catch (error) {
        console.error("Error uploading cover:", error)
        return null
    }
}
