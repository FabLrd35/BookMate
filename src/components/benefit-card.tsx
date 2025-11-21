import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface BenefitCardProps {
    title: string
    description: string
    icon: LucideIcon
    color: string
}

export function BenefitCard({ title, description, icon: Icon, color }: BenefitCardProps) {
    return (
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className={`p-3 rounded-full mb-4 ${color}`}>
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
