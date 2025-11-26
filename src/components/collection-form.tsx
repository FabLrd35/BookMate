"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Image as ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const COLORS = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Red", value: "bg-red-500" },
    { name: "Yellow", value: "bg-yellow-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Indigo", value: "bg-indigo-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Teal", value: "bg-teal-500" },
    { name: "Cyan", value: "bg-cyan-500" },
    { name: "Gray", value: "bg-gray-500" },
    { name: "Slate", value: "bg-slate-500" },
]

interface CollectionFormProps {
    defaultValues?: {
        name?: string
        description?: string
        color?: string
        coverUrl?: string
    }
    action: (formData: FormData) => Promise<void>
    onSuccess?: () => void
}

export function CollectionForm({ defaultValues, action, onSuccess }: CollectionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [coverUrl, setCoverUrl] = useState(defaultValues?.coverUrl || "")
    const [selectedColor, setSelectedColor] = useState(defaultValues?.color || "")

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            // Append color if selected
            if (selectedColor) {
                formData.set("color", selectedColor)
            }

            await action(formData)
            onSuccess?.()
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Nom de la collection</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Mes favoris, À lire cet été..."
                    defaultValue={defaultValues?.name}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Une courte description de cette collection..."
                    defaultValue={defaultValues?.description}
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex flex-wrap gap-2 items-center">
                    {COLORS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => setSelectedColor(color.value)}
                            className={cn(
                                "w-8 h-8 rounded-full transition-all border-2",
                                color.value,
                                selectedColor === color.value
                                    ? "border-primary scale-110 ring-2 ring-offset-2 ring-primary"
                                    : "border-transparent hover:scale-105"
                            )}
                            title={color.name}
                        />
                    ))}

                    {/* Custom Color Picker */}
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <input
                            type="color"
                            id="customColor"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => setSelectedColor(e.target.value)}
                            title="Couleur personnalisée"
                        />
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden",
                                !COLORS.some(c => c.value === selectedColor) && selectedColor && selectedColor !== ""
                                    ? "border-primary ring-2 ring-offset-2 ring-primary"
                                    : "border-muted-foreground/30 hover:border-muted-foreground/50"
                            )}
                            style={{ backgroundColor: !COLORS.some(c => c.value === selectedColor) ? selectedColor : 'transparent' }}
                        >
                            {!COLORS.some(c => c.value === selectedColor) && selectedColor ? null : (
                                <span className="text-xs font-bold text-muted-foreground">+</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSelectedColor("")}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center bg-muted text-muted-foreground transition-all",
                            selectedColor === ""
                                ? "border-primary ring-2 ring-offset-2 ring-primary"
                                : "border-transparent hover:bg-muted/80"
                        )}
                        title="Aucune couleur"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <input type="hidden" name="color" value={selectedColor} />
            </div>

            <div className="space-y-2">
                <Label>Image de couverture</Label>
                <div className="flex items-start gap-4">
                    <div
                        className={cn(
                            "relative w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted",
                            // Only apply tailwind class if it matches one of our presets
                            selectedColor && COLORS.some(c => c.value === selectedColor) ? selectedColor : ""
                        )}
                        style={{
                            // Apply custom color via style if it's not a preset
                            backgroundColor: selectedColor && !COLORS.some(c => c.value === selectedColor) ? selectedColor : undefined
                        }}
                    >
                        {coverUrl ? (
                            <Image
                                src={coverUrl}
                                alt="Cover preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <Input
                            type="file"
                            name="coverFile"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    setCoverUrl(URL.createObjectURL(file))
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Formats acceptés : JPG, PNG, WEBP. Max 5MB.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {defaultValues ? "Enregistrer" : "Créer la collection"}
                </Button>
            </div>
        </form>
    )
}
