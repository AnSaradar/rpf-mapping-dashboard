import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "../ui/alert"
import { cn } from "../../lib/utils"

type AuthLoadingBannerProps = {
    loading: boolean
    message: string
    className?: string
}

export function AuthLoadingBanner({ loading, message, className }: AuthLoadingBannerProps) {
    if (!loading) return null

    return (
        <Alert
            className={cn(
                "border-[#1FBAD6]/35 bg-[#1FBAD6]/12 text-gray-200 [&>svg]:text-[#1FBAD6]",
                "dark:border-[#1FBAD6]/35 dark:bg-[#1FBAD6]/12 dark:text-gray-200 dark:[&>svg]:text-[#1FBAD6]",
                className
            )}
        >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <AlertDescription className="text-gray-300">{message}</AlertDescription>
        </Alert>
    )
}
