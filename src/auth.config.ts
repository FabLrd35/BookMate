import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
            const isOnBooks = nextUrl.pathname.startsWith('/books')
            const isOnLexique = nextUrl.pathname.startsWith('/lexique')
            const isOnProfile = nextUrl.pathname.startsWith('/profile')
            const isOnStats = nextUrl.pathname.startsWith('/stats')
            const isOnCollections = nextUrl.pathname.startsWith('/collections')
            const isOnSearch = nextUrl.pathname.startsWith('/search')
            const isOnAuthPages = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register')
            const isOnRoot = nextUrl.pathname === '/'

            const isProtectedRoute = isOnDashboard || isOnBooks || isOnLexique || isOnProfile || isOnStats || isOnCollections || isOnSearch

            if (isProtectedRoute) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (isOnAuthPages || isOnRoot)) {
                // Redirect logged-in users away from login/register/landing pages to dashboard
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            return true
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
