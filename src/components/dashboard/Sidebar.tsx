'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, SignOutButton } from '@clerk/nextjs'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/quizzes', label: 'Quizzes', icon: '📋' },
  { href: '/responses', label: 'Respostas', icon: '📬' },
  { href: '/gallery', label: 'Galeria', icon: '🖼️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-lg font-bold text-gray-900">🧩 QuizzBuilder</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-gray-600 font-medium">Minha conta</span>
        </div>
        <SignOutButton>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            <span>🚪</span>
            Sair
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
