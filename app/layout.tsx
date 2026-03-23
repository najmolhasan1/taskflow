import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600','700','800'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600'] })
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] })

export const metadata: Metadata = {
  title: 'TaskFlow — Daily Standup Tracker',
  description: 'আপনার টিমের প্রতিদিনের কাজ ট্র্যাক করুন',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} font-body bg-surface-2 text-ink antialiased`}>
        {children}
      </body>
    </html>
  )
}
