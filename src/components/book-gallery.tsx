"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { Plus, Trash2, Image as ImageIcon, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addBookImage, deleteBookImage } from "@/app/actions/book-images"
import { toast } from "sonner"

type BookImage = {
    id: string
    url: string
    caption: string | null
    createdAt: Date
}

interface BookGalleryProps {
    bookId: string
    images: BookImage[]
}

export function BookGallery({ bookId, images }: BookGalleryProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [caption, setCaption] = useState("")
    const [activeTab, setActiveTab] = useState("upload")
    const [isPending, startTransition] = useTransition()
    const [selectedImage, setSelectedImage] = useState<BookImage | null>(null)

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (activeTab === "url" && !url) return
        if (activeTab === "upload" && !file) return

        const formData = new FormData()
        formData.append("bookId", bookId)
        if (caption) formData.append("caption", caption)

        if (activeTab === "url") {
            formData.append("url", url)
        } else if (file) {
            formData.append("file", file)
        }

        startTransition(async () => {
            const result = await addBookImage(formData)
            if (result.success) {
                toast.success("Image ajoutée avec succès")
                setIsOpen(false)
                setUrl("")
                setFile(null)
                setCaption("")
            } else {
                toast.error("Erreur lors de l'ajout de l'image")
            }
        })
    }

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return

        startTransition(async () => {
            const result = await deleteBookImage(imageId, bookId)
            if (result.success) {
                toast.success("Image supprimée")
                if (selectedImage?.id === imageId) {
                    setSelectedImage(null)
                }
            } else {
                toast.error("Erreur lors de la suppression")
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Galerie ({images.length})
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter une photo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une image</DialogTitle>
                            <DialogDescription>
                                Ajoutez une photo depuis votre ordinateur ou via une URL.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAddImage} className="space-y-4">
                            <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="upload">Upload</TabsTrigger>
                                    <TabsTrigger value="url">URL</TabsTrigger>
                                </TabsList>

                                <TabsContent value="upload" className="space-y-4 pt-4">
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            required={activeTab === "upload"}
                                        />
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        {file ? (
                                            <p className="text-sm font-medium text-primary">{file.name}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Cliquez ou glissez une image ici</p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="url" className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="url">URL de l'image</Label>
                                        <Input
                                            id="url"
                                            placeholder="https://exemple.com/image.jpg"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            required={activeTab === "url"}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="space-y-2">
                                <Label htmlFor="caption">Légende (optionnel)</Label>
                                <Input
                                    id="caption"
                                    placeholder="Ma photo préférée..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Ajout..." : "Ajouter"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune image pour le moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                        >
                            <Image
                                src={image.url}
                                alt={image.caption || "Image du livre"}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 h-8 w-8 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteImage(image.id)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            {image.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    {image.caption}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                                {selectedImage.caption && (
                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white p-4 bg-black/50">
                                        {selectedImage.caption}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
