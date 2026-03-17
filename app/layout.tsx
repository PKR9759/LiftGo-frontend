// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'    

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LiftGo — share rides, split costs',
  description: 'Find drivers heading your way or offer empty seats on your route.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-slate-50">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}