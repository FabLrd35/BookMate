"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Upload } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"
import { updateUserImage } from "@/app/actions/user-profile"
import { toast } from "sonner"

interface ProfileHeaderProps {
    user: {
        id: string
        name: string | null
        image: string | null
        bannerUrl: string | null
    }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [cropType, setCropType] = useState<'avatar' | 'banner' | null>(null)
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setSelectedFile(reader.result as string)
                setCropType(type)
                setIsCropperOpen(true)
            }
            reader.readAsDataURL(file)
        }
        // Reset input
        event.target.value = ''
    }

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!cropType) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", croppedBlob)

            const result = await updateUserImage(user.id, formData, cropType)

            if (result.success) {
                toast.success("Image mise à jour avec succès")
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour de l'image")
                console.error("Upload error:", result.error)
            }
        } catch (error) {
            console.error("Client upload error:", error)
            toast.error("Une erreur est survenue lors de l'envoi")
        } finally {
            setIsUploading(false)
            setCropType(null)
            setSelectedFile(null)
        }
    }

    return (
        <div className="relative mb-16">
            {/* Banner */}
            <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl overflow-hidden group">
                {user.bannerUrl ? (
                    <Image
                        src={user.bannerUrl}
                        alt="Banner"
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                        <Upload className="h-12 w-12" />
                    </div>
                )}

                {/* Banner Upload Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label htmlFor="banner-upload" className="cursor-pointer">
                        <div className="bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2 rounded-full shadow-sm border transition-colors">
                            <Camera className="h-5 w-5" />
                        </div>
                        <input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, 'banner')}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-12 left-8 md:left-12">
                <div className="relative group">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background bg-muted overflow-hidden relative">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || "User"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                                {(user.name?.[0] || "U").toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Avatar Upload Button */}
                    <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2 rounded-full shadow-sm border transition-colors">
                                <Camera className="h-4 w-4" />
                            </div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'avatar')}
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* User Info (Name) */}
            <div className="absolute -bottom-10 left-36 md:left-48">
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
            </div>

            {/* Image Cropper Modal */}
            <ImageCropper
                imageSrc={selectedFile}
                open={isCropperOpen}
                onOpenChange={setIsCropperOpen}
                onCropComplete={handleCropComplete}
                aspectRatio={cropType === 'banner' ? 3 / 1 : 1}
            />

            {/* Loading Overlay */}
            {isUploading && (
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">Mise à jour de l'image...</p>
                    </div>
                </div>
            )}
        </div>
    )
}
