import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meetup App',
  description: 'Connect and organize meetups with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
