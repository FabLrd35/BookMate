'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

function RegisterButton() {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Création...' : 'Créer un compte'}
        </Button>
    )
}

export default function RegisterPage() {
    const router = useRouter()
    const [state, dispatch] = useActionState(register, undefined)

    useEffect(() => {
        if (state?.message === 'success') {
            router.push('/dashboard')
        }
    }, [state, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
                    <CardDescription>
                        Créez un compte pour commencer à gérer votre bibliothèque
                    </CardDescription>
                </CardHeader>
                <form action={dispatch}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Jean Dupont"
                                required
                            />
                            {state?.errors?.name && (
                                <p className="text-sm text-red-600">{state.errors.name[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nom@exemple.com"
                                required
                            />
                            {state?.errors?.email && (
                                <p className="text-sm text-red-600">{state.errors.email[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            {state?.errors?.password && (
                                <p className="text-sm text-red-600">{state.errors.password[0]}</p>
                            )}
                        </div>
                        {state?.message && state.message !== 'success' && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                                {state.message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <RegisterButton />
                        <p className="text-center text-sm text-gray-600">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Se connecter
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
