"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import getCroppedImg from "@/lib/canvasUtils"
import { Loader2 } from "lucide-react"

interface ImageCropperProps {
    imageSrc: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onCropComplete: (croppedImageBlob: Blob) => void
    aspectRatio?: number
}

export function ImageCropper({ imageSrc, open, onOpenChange, onCropComplete, aspectRatio = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        setIsLoading(true)
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedImage) {
                onCropComplete(croppedImage)
                onOpenChange(false)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Recadrer l'image</DialogTitle>
                    <DialogDescription>
                        Ajustez la zone de recadrage pour obtenir le meilleur résultat.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative h-[400px] w-full bg-black rounded-md overflow-hidden">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteCallback}
                            onZoomChange={onZoomChange}
                        />
                    )}
                </div>
                <div className="py-4 flex items-center gap-4">
                    <span className="text-sm font-medium w-12">Zoom</span>
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value: number[]) => setZoom(value[0])}
                        className="flex-1"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
