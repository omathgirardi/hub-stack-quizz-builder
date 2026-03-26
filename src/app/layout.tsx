import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hub Stack Quizz Builder',
  description: 'Crie e gerencie quizzes interativos de diagnóstico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
