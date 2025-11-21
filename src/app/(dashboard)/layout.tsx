import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Toaster } from "sonner";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BookMate - Suivez votre parcours de lecture",
    description: "Une belle application pour suivre, noter et gérer votre collection de livres",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    // Fetch user data from database to get updated profile image
    let user = null;
    if (session?.user?.email) {
        const { prisma } = await import('@/lib/prisma');
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                image: true,
            },
        });

        if (dbUser) {
            user = {
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image,
            };
        }
    }

    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={`${inter.className} h-screen overflow-hidden`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* Layout principal : sidebar fixe + contenu scrollable */}
                    <div className="flex h-full">
                        <Sidebar />

                        <div className="flex flex-1 flex-col min-w-0">
                            <Topbar user={user} />

                            <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6 [scrollbar-gutter:stable]">
                                {children}
                            </main>
                        </div>
                    </div>

                    <Toaster richColors position="top-center" />
                </ThemeProvider>
            </body>
        </html>
    );
}
