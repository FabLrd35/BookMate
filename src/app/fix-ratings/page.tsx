"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { recoverCorruptedRatings } from "@/app/actions/fix-ratings"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export default function FixRatingsPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [result, setResult] = useState<any>(null)

    const handleFix = async () => {
        setStatus("loading")
        try {
            const res = await recoverCorruptedRatings()
            setResult(res)
            setStatus(res.success ? "success" : "error")
        } catch (e) {
            setStatus("error")
        }
    }

    return (
        <div className="container max-w-2xl py-20">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        Réparation des Notations
                    </CardTitle>
                    <CardDescription>
                        Cet outil va scanner votre base de données pour trouver les notes corrompues (ex: 1.5e-323) et les restaurer à leur valeur d'origine (ex: 1.5).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-md text-sm">
                        <p><strong>Problème détecté :</strong> Les notes étaient enregistrées en notation scientifique à cause d'un bug de sérialisation.</p>
                        <p><strong>Solution :</strong> Nous pouvons récupérer la valeur correcte cachée dans la notation scientifique.</p>
                    </div>

                    <Button
                        onClick={handleFix}
                        disabled={status === "loading"}
                        className="w-full"
                        size="lg"
                    >
                        {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lancer la réparation
                    </Button>

                    {result && (
                        <div className={`p-4 rounded-md ${result.success ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                            <h3 className="font-bold flex items-center gap-2">
                                {result.success ? <CheckCircle className="h-5 w-5" /> : null}
                                {result.message || result.error}
                            </h3>
                            {result.logs && result.logs.length > 0 && (
                                <ul className="mt-2 text-xs space-y-1 font-mono">
                                    {result.logs.map((log: string, i: number) => (
                                        <li key={i}>{log}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
