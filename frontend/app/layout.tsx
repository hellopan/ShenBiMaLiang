import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
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
        <ThemeProvider attribute="class" defaultTheme="glass" themes={['glass', 'light', 'dark']} enableSystem={false} disableTransitionOnChange>
          {/* ── Decorative gradient orbs (fixed, below all content, glass theme only) ── */}
          <div
            className="gradient-orbs fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
          >
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '15%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '40%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
          </div>

          {/* ── Page content above orbs ──────────────────────────────────── */}
          <div className="relative" style={{ zIndex: 1 }}>
            <StoreProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </StoreProvider>
          </div>
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{ duration: 3000 }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
