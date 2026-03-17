// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { clearAuth, getUser, isLoggedIn } from '@/lib/auth'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setLoggedIn(isLoggedIn())
    const user = getUser()
    if (user) setUserName(user.name)
  }, [])

  const handleLogout = () => {
    clearAuth()
    setLoggedIn(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* logo */}
        <Link href="/" className="text-xl font-bold text-slate-900">
          LiftGo
        </Link>

        {/* links */}
        <div className="flex items-center gap-6">
          <Link
            href="/rides"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Find a ride
          </Link>

          {loggedIn && (
            <>
              <Link
                href="/rides/new"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Offer a ride
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
            </>
          )}
        </div>

        {/* auth buttons */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link
                href="/profile"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {userName}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}