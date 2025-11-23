import { getGlobalGallery } from "@/app/actions/gallery"
import { GalleryGrid } from "@/components/gallery-grid"

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

            <GalleryGrid images={images} />
        </div>
    )
}
