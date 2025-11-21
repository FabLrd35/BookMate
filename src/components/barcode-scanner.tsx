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
        } catch (error) {
            console.error("Error starting scanner:", error)
            toast.error("Impossible d'accéder à la caméra")
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
