"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Download } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/star-rating"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"

interface BookExportDialogProps {
    book: {
        title: string
        author: { name: string }
        coverUrl: string | null
        rating: number | null
        comment: string | null
        status: string
        finishDate: Date | null
        quotes: { text: string }[]
    }
}

export function BookExportDialog({ book }: BookExportDialogProps) {
    const [open, setOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const previewRef = useRef<HTMLDivElement>(null)

    // Customization State
    const [showRating, setShowRating] = useState(true)
    const [showReview, setShowReview] = useState(true)
    const [showQuote, setShowQuote] = useState(false)
    const [showDate, setShowDate] = useState(true)
    const [theme, setTheme] = useState<'light' | 'dark' | 'gradient' | 'glass'>('gradient')
    const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait'>('portrait')

    const handleExport = async () => {
        if (!previewRef.current) return

        try {
            setIsExporting(true)
            // Small delay to ensure styles are applied
            await new Promise(resolve => setTimeout(resolve, 100))

            const image = await toPng(previewRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: 'transparent',
            })

            const link = document.createElement("a")
            link.href = image
            link.download = `bookmate-${book.title.toLowerCase().replace(/\s+/g, '-')}.png`
            link.click()

            // Optional: Share API if supported
            if (navigator.share) {
                try {
                    const blob = await (await fetch(image)).blob()
                    const file = new File([blob], "book-card.png", { type: "image/png" })
                    await navigator.share({
                        files: [file],
                        title: book.title,
                        text: `Mon avis sur ${book.title} par ${book.author.name}`,
                    })
                } catch (err) {
                    console.log("Share skipped or failed", err)
                }
            }
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const themes = {
        light: "bg-white text-slate-900 border-slate-200",
        dark: "bg-slate-950 text-slate-50 border-slate-800",
        gradient: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent",
        glass: "bg-black/40 backdrop-blur-xl text-white border-white/20",
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Partager / Exporter">
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6">

                {/* Controls Column */}
                <div className="w-full md:w-80 flex-shrink-0 space-y-6">
                    <DialogHeader>
                        <DialogTitle>Partager ma lecture</DialogTitle>
                        <DialogDescription>
                            Personnalisez la carte à partager sur vos réseaux.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thème</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['light', 'dark', 'gradient', 'glass'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={cn(
                                            "h-10 rounded-md border-2 transition-all",
                                            theme === t ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted",
                                            t === 'light' ? "bg-white border-slate-200" :
                                                t === 'dark' ? "bg-slate-950" :
                                                    t === 'gradient' ? "bg-gradient-to-br from-indigo-500 to-pink-500" :
                                                        "bg-slate-500"
                                        )}
                                        aria-label={`Thème ${t}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Format</Label>
                            <Tabs value={aspectRatio} onValueChange={(v) => setAspectRatio(v as any)} className="w-full">
                                <TabsList className="w-full">
                                    <TabsTrigger value="square" className="flex-1">Carré (1:1)</TabsTrigger>
                                    <TabsTrigger value="portrait" className="flex-1">Story (9:16)</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contenu</Label>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-rating" className="cursor-pointer">Note</Label>
                                <Switch id="show-rating" checked={showRating} onCheckedChange={setShowRating} />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-review" className="cursor-pointer">Mon avis</Label>
                                <Switch id="show-review" checked={showReview} onCheckedChange={setShowReview} />
                            </div>

                            {book.quotes.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-quote" className="cursor-pointer">Citation favorite</Label>
                                    <Switch id="show-quote" checked={showQuote} onCheckedChange={setShowQuote} />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-date" className="cursor-pointer">Date de lecture</Label>
                                <Switch id="show-date" checked={showDate} onCheckedChange={setShowDate} />
                            </div>
                        </div>

                        <Button onClick={handleExport} className="w-full mt-4" disabled={isExporting}>
                            {isExporting ? (
                                <>Génération...</>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger l'image
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="flex-1 bg-muted/30 rounded-lg p-4 flex items-center justify-center overflow-hidden min-h-[500px]">
                    <div
                        ref={previewRef}
                        className={cn(
                            "relative flex flex-col p-8 shadow-2xl transition-all duration-300 overflow-hidden",
                            themes[theme],
                            aspectRatio === 'square' ? "w-[500px] h-[500px]" : "w-[360px] h-[640px]"
                        )}
                    >
                        {/* Background Image for Glass Theme */}
                        {theme === 'glass' && book.coverUrl && (
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={book.coverUrl}
                                    alt=""
                                    fill
                                    className="object-cover opacity-60 blur-xl scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full items-center text-center">

                            {/* Header / Logo */}
                            <div className="mb-6 opacity-80 text-xs font-bold tracking-[0.2em] uppercase">
                                BookMate Review
                            </div>

                            {/* Cover */}
                            <div className="relative w-32 h-48 mb-6 shadow-2xl rounded-md overflow-hidden flex-shrink-0 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                {book.coverUrl ? (
                                    <Image
                                        src={book.coverUrl}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                        No Cover
                                    </div>
                                )}
                            </div>

                            {/* Title & Author */}
                            <h2 className="text-2xl font-bold leading-tight mb-2 line-clamp-2">
                                {book.title}
                            </h2>
                            <p className="text-sm opacity-90 mb-4">
                                {book.author.name}
                            </p>

                            {/* Rating */}
                            {showRating && book.rating && (
                                <div className="mb-6 flex justify-center">
                                    <StarRating rating={book.rating} size="lg" />
                                </div>
                            )}

                            {/* Review / Quote */}
                            <div className="flex-1 flex items-center justify-center w-full">
                                {showQuote && book.quotes.length > 0 ? (
                                    <blockquote className="italic font-serif text-lg leading-relaxed opacity-90 relative px-4">
                                        "{book.quotes[0].text}"
                                    </blockquote>
                                ) : showReview && book.comment ? (
                                    <p className="text-sm leading-relaxed opacity-90 line-clamp-6 px-4">
                                        {book.comment}
                                    </p>
                                ) : null}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t border-current/20 w-full flex justify-between items-end text-xs opacity-70">
                                <div>
                                    {showDate && book.finishDate && (
                                        <span>Lu le {new Date(book.finishDate).toLocaleDateString('fr-FR')}</span>
                                    )}
                                </div>
                                <div className="font-semibold">
                                    bookmate.app
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
