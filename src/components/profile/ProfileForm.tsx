'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
    user: {
        id: string
        name: string
        email: string
        image: string | null
        bannerUrl: string | null
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        formData.append('userId', user.id)
        const result = await updateProfile(formData)
        setIsLoading(false)

        if (result.success) {
            router.refresh()
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Modifier le profil</CardTitle>
                <CardDescription>Personnalisez votre profil avec une bannière et une photo</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input id="name" name="name" defaultValue={user.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">URL de la photo de profil</Label>
                        <Input
                            id="image"
                            name="image"
                            type="url"
                            placeholder="https://exemple.com/photo.jpg"
                            defaultValue={user.image || ''}
                        />
                        <p className="text-sm text-gray-500">Entrez l'URL d'une image pour votre photo de profil</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bannerUrl">URL de la bannière</Label>
                        <Input
                            id="bannerUrl"
                            name="bannerUrl"
                            type="url"
                            placeholder="https://exemple.com/banniere.jpg"
                            defaultValue={user.bannerUrl || ''}
                        />
                        <p className="text-sm text-gray-500">Entrez l'URL d'une image pour votre bannière (recommandé: 1500x400px)</p>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
