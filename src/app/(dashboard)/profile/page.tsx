import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { ProfileHeader } from '@/components/profile-header'

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    // Fetch full user data from database
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bannerUrl: true,
            _count: {
                select: {
                    books: true,
                    words: true,
                    quotes: true,
                },
            },
        },
    })

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <ProfileHeader user={user} />

            {/* Profile Content */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-end sm:space-x-5">
                    <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <form action={logout}>
                            <Button type="submit" variant="outline" className="gap-2">
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Livres</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{user._count.books}</dd>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Mots</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{user._count.words}</dd>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                        <dt className="truncate text-sm font-medium text-gray-500">Citations</dt>
                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{user._count.quotes}</dd>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="mt-8">
                    <ProfileForm user={user} />
                </div>
            </div>
        </div>
    )
}
