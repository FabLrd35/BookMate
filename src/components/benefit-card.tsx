import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface BenefitCardProps {
    title: string
    description: string
    icon: LucideIcon
    color: string
    theme?: 'teal' | 'purple'
}

export function BenefitCard({ title, description, icon: Icon, color, theme = 'teal' }: BenefitCardProps) {
    const themeColors = {
        teal: "text-teal-500 bg-teal-100 dark:bg-teal-900/20",
        purple: "text-purple-500 bg-purple-100 dark:bg-purple-900/20"
    }

    // If theme is provided, we override the default 'color' prop (which contains specific teal/cyan classes)
    // with a unified theme color for consistency, or we could map them intelligently.
    // For now, let's strictly follow the page theme:
    const finalColorClass = themeColors[theme]

    return (
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className={`p-3 rounded-full mb-4 ${finalColorClass}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
