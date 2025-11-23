"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"

type GalleryImage = {
    id: string
    url: string
    caption: string | null
    book: {
        id: string
        title: string
    }
}

interface GalleryGridProps {
    images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
                <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">Galerie vide</h3>
                <p className="text-muted-foreground mt-2">
                    Ajoutez des photos dans la galerie de vos livres pour les voir apparaître ici.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                    >
                        <Image
                            src={image.url}
                            alt={image.caption || `Image de ${image.book.title}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                            <p className="text-white text-xs font-medium line-clamp-2 mb-1">
                                {image.caption || "Sans légende"}
                            </p>
                            <Link
                                href={`/books/${image.book.id}`}
                                className="text-white/80 text-[10px] hover:text-white hover:underline truncate"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {image.book.title}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
                    <div className="relative h-[80vh] w-full flex items-center justify-center">
                        {selectedImage && (
                            <>
                                <Image
                                    src={selectedImage.url}
                                    alt={selectedImage.caption || "Image en grand"}
                                    fill
                                    className="object-contain"
                                />

                                {/* Close button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    <X className="h-6 w-6" />
                                </Button>

                                {/* Previous button */}
                                {images.length > 1 && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                                            onClick={() => {
                                                const currentIndex = images.findIndex(img => img.id === selectedImage.id)
                                                const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
                                                setSelectedImage(images[prevIndex])
                                            }}
                                        >
                                            <ChevronLeft className="h-8 w-8" />
                                        </Button>

                                        {/* Next button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                                            onClick={() => {
                                                const currentIndex = images.findIndex(img => img.id === selectedImage.id)
                                                const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
                                                setSelectedImage(images[nextIndex])
                                            }}
                                        >
                                            <ChevronRight className="h-8 w-8" />
                                        </Button>

                                        {/* Image counter */}
                                        <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                                            {images.findIndex(img => img.id === selectedImage.id) + 1} / {images.length}
                                        </div>
                                    </>
                                )}

                                {/* Caption and book info */}
                                <div className="absolute bottom-4 left-0 right-0 text-center text-white p-4 bg-black/50">
                                    {selectedImage.caption && (
                                        <p className="mb-2">{selectedImage.caption}</p>
                                    )}
                                    <Link
                                        href={`/books/${selectedImage.book.id}`}
                                        className="text-sm text-white/80 hover:text-white hover:underline"
                                        onClick={() => setSelectedImage(null)}
                                    >
                                        {selectedImage.book.title}
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
