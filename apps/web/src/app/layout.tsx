import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KifCover | Embedded Insurance Infrastructure for Ethiopia',
  description: 'KifCover empowers digital platforms to embed insurance products seamlessly. API-first infrastructure for fintechs, e-commerce, ride-hailing, and more.',
  keywords: 'embedded insurance, insurtech, Ethiopia, API insurance, digital insurance',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-main text-on-surface antialiased">
        {children}
      </body>
    </html>
  )
}
