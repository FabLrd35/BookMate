"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Camera, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BarcodeScannerProps {
    onScanSuccess: (isbn: string) => void
}

export function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const scannerDivRef = useRef<HTMLDivElement>(null)

    const startScanner = async () => {
        try {
            setIsLoading(true)

            // Check if we're on HTTPS or localhost
            const isSecureContext = window.isSecureContext
            if (!isSecureContext) {
                toast.error("Le scanner nécessite une connexion HTTPS sécurisée")
                setIsLoading(false)
                return
            }

            // Check if camera API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Votre navigateur ne supporte pas l'accès à la caméra")
                setIsLoading(false)
                return
            }

            const scanner = new Html5Qrcode("barcode-scanner")
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: "environment" }, // Caméra arrière
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // Succès du scan
                    stopScanner()
                    onScanSuccess(decodedText)
                    toast.success("Code-barres scanné !")
                },
                (errorMessage) => {
                    // Erreur silencieuse (scan en cours)
                }
            )

            setIsScanning(true)
            setIsLoading(false)
        } catch (error: any) {
            console.error("Error starting scanner:", error)

            // Provide specific error messages
            let errorMessage = "Impossible d'accéder à la caméra"

            if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
                errorMessage = "Permission refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur, puis rechargez la page"
            } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
                errorMessage = "Aucune caméra trouvée sur cet appareil"
            } else if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
                errorMessage = "La caméra est déjà utilisée par une autre application"
            } else if (error?.name === "OverconstrainedError") {
                errorMessage = "Impossible d'utiliser la caméra arrière. Essayez de fermer d'autres applications utilisant la caméra"
            } else if (error?.message) {
                // Show the actual error message for debugging
                console.log("Camera error details:", error)
                errorMessage = `Erreur caméra: ${error.message}`
            }

            toast.error(errorMessage, { duration: 5000 })
            setIsLoading(false)
        }
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop()
                scannerRef.current.clear()
                scannerRef.current = null
            } catch (error) {
                console.error("Error stopping scanner:", error)
            }
        }
        setIsScanning(false)
    }

    useEffect(() => {
        return () => {
            stopScanner()
        }
    }, [])

    return (
        <div className="space-y-4">
            {!isScanning ? (
                <Button
                    type="button"
                    variant="outline"
                    onClick={startScanner}
                    disabled={isLoading}
                    className="w-full gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Chargement...
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4" />
                            Scanner un code-barres
                        </>
                    )}
                </Button>
            ) : (
                <div className="space-y-2">
                    <div
                        id="barcode-scanner"
                        ref={scannerDivRef}
                        className="rounded-lg overflow-hidden border-2 border-primary"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={stopScanner}
                        className="w-full gap-2"
                    >
                        <X className="h-4 w-4" />
                        Annuler
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                        Pointez la caméra vers le code-barres du livre
                    </p>
                </div>
            )}
        </div>
    )
}
