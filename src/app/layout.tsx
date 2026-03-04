import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navigation } from '@/components/navigation/Navigation'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: siteConfig.communityName,
  description: 'Connect and organize community events with ease',
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
          <div className="mx-auto max-w-6xl px-4 space-y-2">
            <p>&copy; {new Date().getFullYear()} {siteConfig.communityName}. All rights reserved.</p>
            {siteConfig.creatorName && (
              <p>
                Created by{' '}
                {siteConfig.creatorUrl ? (
                  <a href={siteConfig.creatorUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">{siteConfig.creatorName}</a>
                ) : (
                  siteConfig.creatorName
                )}
                {siteConfig.creatorRole && <> &mdash; {siteConfig.creatorRole}</>}
              </p>
            )}
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}
