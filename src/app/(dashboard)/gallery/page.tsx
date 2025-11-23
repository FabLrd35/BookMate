import { getGlobalGallery } from "@/app/actions/gallery"
import { Card } from "@/components/ui/card"
import { ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default async function GalleryPage() {
    const images = await getGlobalGallery()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Ma Galerie</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Retrouvez toutes les photos ajoutées à vos livres.
                    </p>
                </div>
            </div>

            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">Galerie vide</h3>
                    <p className="text-muted-foreground mt-2">
                        Ajoutez des photos dans la galerie de vos livres pour les voir apparaître ici.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
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
                                >
                                    {image.book.title}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
