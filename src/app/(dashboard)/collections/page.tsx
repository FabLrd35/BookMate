import { getCollections, createCollection, deleteCollection } from "@/app/actions/collections"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Folder, Plus, Trash2 } from "lucide-react"
import { BookshelfPreview } from "@/components/bookshelf-preview"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export default async function CollectionsPage() {
    const collections = await getCollections()

    async function create(formData: FormData) {
        "use server"
        const name = formData.get("name") as string
        if (name) {
            await createCollection(name)
        }
    }

    async function remove(id: string) {
        "use server"
        await deleteCollection(id)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Mes Collections</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Organisez votre bibliothèque avec des listes personnalisées.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Nouvelle Collection</span>
                            <span className="sm:hidden">Nouvelle</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer une collection</DialogTitle>
                            <DialogDescription>
                                Créez une nouvelle liste pour regrouper vos livres.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={create}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Nom
                                    </Label>
                                    <Input id="name" name="name" className="col-span-3" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Créer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                    <Card key={collection.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 min-w-0 flex-1">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                        <Link href={`/collections/${collection.id}`} className="hover:underline truncate">
                                            {collection.name}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        {collection._count.books} livre{collection._count.books > 1 ? "s" : ""}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <BookshelfPreview
                                books={collection.books}
                                totalCount={collection._count.books}
                            />
                        </CardContent>
                        <CardFooter className="border-t pt-3 sm:pt-4 flex justify-between">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/collections/${collection.id}`}>
                                    Ouvrir
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Cela supprimera définitivement la collection
                                            "{collection.name}". Les livres ne seront pas supprimés.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <form action={remove.bind(null, collection.id)}>
                                            <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Supprimer
                                            </AlertDialogAction>
                                        </form>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
                {collections.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Aucune collection</h3>
                        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                            Commencez par créer votre première collection !
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
