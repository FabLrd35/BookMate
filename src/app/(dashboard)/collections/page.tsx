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
import { Folder, Plus, Trash2, ChevronRight } from "lucide-react"
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

            <div className="flex flex-col gap-3">
                {collections.map((collection) => (
                    <div
                        key={collection.id}
                        className="group flex items-center justify-between p-4 bg-card hover:bg-accent/50 border rounded-lg transition-all"
                    >
                        <Link href={`/collections/${collection.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                                <Folder className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold truncate text-base">
                                    {collection.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {collection._count.books} livre{collection._count.books > 1 ? "s" : ""}
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    >
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
                            <Button variant="ghost" size="icon" asChild className="text-muted-foreground">
                                <Link href={`/collections/${collection.id}`}>
                                    <ChevronRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
                {collections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
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
