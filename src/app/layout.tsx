import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'AL-TARYAQI - منصة المناقصات الطبية',
  description: 'منصة ربط المعامل الطبية بالموردين',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-gray-50" style={{fontFamily: 'Cairo, sans-serif'}}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
