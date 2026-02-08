import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/navigation/Navigation'

export const metadata: Metadata = {
  title: 'Claude Code Milan',
  description: 'Connect and organize meetups with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <p>&copy; {new Date().getFullYear()} Claude Code Milan. All rights reserved.</p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}
