import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

interface PanelProps {
    title: string
    icon?: LucideIcon
    action?: ReactNode
    children: ReactNode
    footer?: ReactNode
    className?: string
    contentClassName?: string
}

export function Panel({ title, icon: Icon, action, children, footer, className, contentClassName }: PanelProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>
                    {Icon && <Icon className="w-4 h-4" />}
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
            {footer && (
                <CardFooter className="text-center justify-center">
                    {footer}
                </CardFooter>
            )}
        </Card>
    )
}
