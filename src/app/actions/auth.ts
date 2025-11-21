'use server'

import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Email ou mot de passe incorrect.'
                default:
                    return 'Une erreur est survenue.'
            }
        }
        throw error
    }
}

export async function register(
    prevState: { message?: string; errors?: any } | undefined,
    formData: FormData,
) {
    // Validate form fields
    const validatedFields = registerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })

    // If form validation fails, return errors early
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs manquants. Échec de la création du compte.',
        }
    }

    const { name, email, password } = validatedFields.data

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                message: 'Un compte avec cet email existe déjà.',
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        // Auto sign in after registration
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        return { message: 'success' }
    } catch (error) {
        console.error('Registration error:', error)
        return {
            message: 'Erreur lors de la création du compte.',
        }
    }
}

export async function logout() {
    await signOut()
}

export async function updateProfile(formData: FormData) {
    try {
        const userId = formData.get('userId') as string
        const name = formData.get('name') as string
        const image = formData.get('image') as string
        const bannerUrl = formData.get('bannerUrl') as string

        await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                image: image || null,
                bannerUrl: bannerUrl || null,
            },
        })

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: 'Failed to update profile' }
    }
}
