"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { FolderOpen, Camera } from "lucide-react"
import { EditCollectionDialog } from "./collection-dialogs"

interface CollectionHeaderProps {
    collection: {
        id: string
        name: string
        description: string | null
        coverUrl: string | null
        color: string | null
        books: any[]
    }
    updateAction: (formData: FormData) => Promise<void>
}

export function CollectionHeader({ collection, updateAction }: CollectionHeaderProps) {
    return (
        <div className="relative mb-8">
            {/* Banner */}
            <div
                className={cn(
                    "relative h-48 md:h-64 w-full rounded-xl overflow-hidden shadow-sm group",
                    !collection.coverUrl && !collection.color && "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30",
                    !collection.coverUrl && collection.color && collection.color.startsWith("bg-") ? collection.color : ""
                )}
                style={!collection.coverUrl && collection.color && !collection.color.startsWith("bg-") ? { backgroundColor: collection.color } : undefined}
            >
                {collection.coverUrl ? (
                    <Image
                        src={collection.coverUrl}
                        alt={collection.name}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                        <FolderOpen className="h-16 w-16" />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 sm:opacity-40" />

                {/* Camera Button - Edit Cover */}
                <div className="absolute top-4 right-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <EditCollectionDialog
                        collection={collection}
                        updateAction={updateAction}
                        trigger={
                            <div className="bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2 rounded-full shadow-sm border transition-colors cursor-pointer">
                                <Camera className="h-5 w-5" />
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Collection Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-4 px-2">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{collection.name}</h1>
                    {collection.description && (
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            {collection.description}
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                        {collection.books.length} livre{collection.books.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>
        </div>
    )
}
