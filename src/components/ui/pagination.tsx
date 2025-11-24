"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const [inputPage, setInputPage] = useState("")

    if (totalPages <= 1) return null

    const pages: (number | string)[] = []

    // Always show first page
    pages.push(1)

    // Show pages around current page
    if (currentPage > 3) {
        pages.push("...")
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
    }

    // Show last page
    if (currentPage < totalPages - 2) {
        pages.push("...")
    }
    if (totalPages > 1) {
        pages.push(totalPages)
    }

    const handleGoToPage = () => {
        const pageNum = parseInt(inputPage)
        if (pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum)
            setInputPage("")
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleGoToPage()
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {pages.map((page, index) => (
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            onClick={() => onPageChange(page as number)}
                            className="h-9 w-9"
                        >
                            {page}
                        </Button>
                    )
                ))}

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Go to page input */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Aller à :</span>
                <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`1-${totalPages}`}
                    className="h-9 w-20 text-center"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoToPage}
                    disabled={!inputPage || parseInt(inputPage) < 1 || parseInt(inputPage) > totalPages}
                    className="h-9"
                >
                    OK
                </Button>
            </div>
        </div>
    )
}
