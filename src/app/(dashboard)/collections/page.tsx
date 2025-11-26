import { getCollections, createCollection, deleteCollection, updateCollection } from "@/app/actions/collections"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Folder, Plus, Trash2, ChevronRight, Pencil } from "lucide-react"
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
import { CreateCollectionDialog, EditCollectionDialog } from "@/components/collection-dialogs"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default async function CollectionsPage() {
    const collections = await getCollections()

    async function create(formData: FormData) {
        "use server"
        await createCollection(formData)
    }

    async function update(id: string, formData: FormData) {
        "use server"
        await updateCollection(id, formData)
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
                <CreateCollectionDialog createAction={create} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                    <div
                        key={collection.id}
                        className="group relative flex flex-col justify-between p-4 bg-card hover:bg-accent/50 border rounded-lg transition-all overflow-hidden"
                    >
                        {/* Background Color/Image Effect */}
                        {collection.color && (
                            <div
                                className={cn(
                                    "absolute inset-0 opacity-5 pointer-events-none",
                                    collection.color.startsWith("bg-") ? collection.color : ""
                                )}
                                style={!collection.color.startsWith("bg-") ? { backgroundColor: collection.color } : undefined}
                            />
                        )}

                        <div className="flex items-start justify-between gap-4 z-10">
                            <Link href={`/collections/${collection.id}`} className="flex items-start gap-4 flex-1 min-w-0 group-hover:opacity-80 transition-opacity">
                                <div
                                    className={cn(
                                        "relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
                                        collection.color && collection.color.startsWith("bg-") ? collection.color : "bg-primary/10 text-primary"
                                    )}
                                    style={collection.color && !collection.color.startsWith("bg-") ? { backgroundColor: collection.color } : undefined}
                                >
                                    {collection.coverUrl ? (
                                        <Image
                                            src={collection.coverUrl}
                                            alt={collection.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Folder className={cn("h-6 w-6", collection.color && "text-white")} />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-semibold truncate text-lg">
                                        {collection.name}
                                    </span>
                                    {collection.description && (
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {collection.description}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {collection._count.books} livre{collection._count.books > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex flex-col gap-1">
                                <EditCollectionDialog
                                    collection={collection}
                                    updateAction={update.bind(null, collection.id)}
                                />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                            </div>
                        </div>
                    </div>
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
