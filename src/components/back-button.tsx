"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface BackButtonProps {
    fallbackUrl?: string
}

export function BackButton({ fallbackUrl }: BackButtonProps) {
    const router = useRouter()

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else if (fallbackUrl) {
            router.push(fallbackUrl)
        } else {
            router.push("/books")
        }
    }

    return (
        <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent hover:text-foreground text-muted-foreground"
            onClick={handleBack}
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
        </Button>
    )
}
