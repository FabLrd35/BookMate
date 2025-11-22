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

import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [state, dispatch] = useActionState(register, undefined)

    useEffect(() => {
        if (state?.message === 'success') {
            router.push('/dashboard')
        }
    }, [state, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
            <div className="absolute top-4 left-4">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </Link>
            </div>
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <Card className="w-full max-w-md border-muted/40 bg-card/50 backdrop-blur-sm">
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
                                className="bg-background/50"
                            />
                            {state?.errors?.name && (
                                <p className="text-sm text-red-600 dark:text-red-400">{state.errors.name[0]}</p>
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
                                className="bg-background/50"
                            />
                            {state?.errors?.email && (
                                <p className="text-sm text-red-600 dark:text-red-400">{state.errors.email[0]}</p>
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
                                className="bg-background/50"
                            />
                            {state?.errors?.password && (
                                <p className="text-sm text-red-600 dark:text-red-400">{state.errors.password[0]}</p>
                            )}
                        </div>
                        {state?.message && state.message !== 'success' && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-800 dark:text-red-300">
                                {state.message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-6">
                        <RegisterButton />
                        <p className="text-center text-sm text-muted-foreground">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
