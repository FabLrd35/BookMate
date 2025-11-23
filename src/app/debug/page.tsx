"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { debugParseFloat, debugDatabaseRating } from "@/app/actions/debug"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DebugPage() {
    const [parseFloatResult, setParseFloatResult] = useState<any>(null)
    const [dbResult, setDbResult] = useState<any>(null)
    const [testRating, setTestRating] = useState("3")
    const [loading, setLoading] = useState(false)

    async function testParseFloat() {
        setLoading(true)
        try {
            const result = await debugParseFloat()
            setParseFloatResult(result)
            console.log("ParseFloat test result:", result)
        } catch (error) {
            console.error("Error testing parseFloat:", error)
        } finally {
            setLoading(false)
        }
    }

    async function testDatabase() {
        setLoading(true)
        try {
            const rating = parseFloat(testRating)
            const result = await debugDatabaseRating(rating)
            setDbResult(result)
            console.log("Database test result:", result)
        } catch (error) {
            console.error("Error testing database:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">🔬 Debug Rating Bug</h1>
                <p className="text-muted-foreground">
                    Test parseFloat and database behavior in production
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Test 1: parseFloat Behavior</CardTitle>
                    <CardDescription>
                        Tests if parseFloat works correctly in the current runtime
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={testParseFloat} disabled={loading}>
                        Run parseFloat Test
                    </Button>

                    {parseFloatResult && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Environment:</h3>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                    {JSON.stringify(parseFloatResult.environment, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Test Results:</h3>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                    {JSON.stringify(parseFloatResult.results, null, 2)}
                                </pre>
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <p className="font-semibold mb-2">🔍 Check for:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Are parsed values correct? (e.g., "3" → 3)</li>
                                    <li>Is any value equal to Number.MIN_VALUE?</li>
                                    <li>What runtime is being used?</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Test 2: Database Round-Trip</CardTitle>
                    <CardDescription>
                        Creates a test book, writes a rating, and reads it back
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="testRating">Test Rating Value</Label>
                        <Input
                            id="testRating"
                            type="number"
                            step="0.5"
                            min="0"
                            max="5"
                            value={testRating}
                            onChange={(e) => setTestRating(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <Button onClick={testDatabase} disabled={loading}>
                        Run Database Test
                    </Button>

                    {dbResult && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Results:</h3>
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                                    {JSON.stringify(dbResult, null, 2)}
                                </pre>
                            </div>

                            {dbResult.isCorrupted && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="font-semibold text-red-700 dark:text-red-400 mb-2">
                                        ⚠️ CORRUPTION DETECTED!
                                    </p>
                                    <p className="text-sm">
                                        Corruption point: <strong>{dbResult.corruptionPoint}</strong>
                                    </p>
                                </div>
                            )}

                            {!dbResult.isCorrupted && dbResult.success && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="font-semibold text-green-700 dark:text-green-400">
                                        ✅ No corruption detected - values match!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardHeader>
                    <CardTitle>📋 Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>1.</strong> Run both tests in production</p>
                    <p><strong>2.</strong> Check the browser console for detailed logs</p>
                    <p><strong>3.</strong> Check Vercel logs for server-side output</p>
                    <p><strong>4.</strong> Compare results between local and production</p>
                    <p className="pt-2 text-muted-foreground">
                        These tests will help identify exactly where the rating transformation occurs.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
