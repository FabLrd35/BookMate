"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ExpandableTextProps {
    text: string
    maxLines?: number
    className?: string
}

export function ExpandableText({ text, maxLines = 3, className = "" }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Check if text is long enough to need expansion
    const lines = text.split('\n')
    const needsExpansion = lines.length > maxLines || text.length > 200

    return (
        <div className="space-y-2 w-full overflow-hidden">
            <p
                className={`text-foreground/90 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere ${className} ${!isExpanded && needsExpansion ? 'line-clamp-3 overflow-hidden' : ''
                    }`}
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
                {text}
            </p>
            {needsExpansion && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
                >
                    {isExpanded ? "Voir moins" : "Voir plus"}
                </Button>
            )}
        </div>
    )
}
