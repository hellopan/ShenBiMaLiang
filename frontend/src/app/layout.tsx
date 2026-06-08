import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '神笔马良 · AI 小说创作',
  description: 'AI 驱动的小说写作工作台，支持章节、幕扩写、世界观词条与多模型配置',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <StoreProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
