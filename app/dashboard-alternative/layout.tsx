import { ThemeProvider } from "@/components/providers/theme-provider"
import "../globals.css"
import { Inter } from "next/font/google"
import { SettingsProvider } from "@/components/new-dashboard/contexts/settings-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { NewSidebar } from "@/components/new-dashboard/new-sidebar"
import { NewTopNav } from "@/components/new-dashboard/NewTopNav"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Expense Tracker Dashboard",
  description: "A modern, responsive financial dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SettingsProvider>
                <TooltipProvider delayDuration={0}>
                    <div className="min-h-screen flex  bg-white dark:bg-gray-900">
                        <NewSidebar />
                        <div className="flex-1">
                        <NewTopNav />
                        <div className="container mx-auto p-6 max-w-7xl">
                            <main className="w-full">{children}</main>
                        </div>
                        </div>
                    </div>
                </TooltipProvider>
            </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}