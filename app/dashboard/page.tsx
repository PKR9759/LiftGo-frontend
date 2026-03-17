// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RideCard from '@/components/RideCard'
import BookingCard from '@/components/BookingCard'
import {
  getMyRides,
  getMyBookings,
  getIncomingBookings,
  confirmBooking,
  cancelBooking,
  cancelRide,
} from '@/lib/api'
import { getUser } from '@/lib/auth'
import type { Ride, Booking } from '@/types'

type Tab = 'my-rides' | 'incoming' | 'my-bookings'

export default function DashboardPage() {
  const user = getUser()

  const [tab, setTab]               = useState<Tab>('my-rides')
  const [myRides, setMyRides]       = useState<Ride[]>([])
  const [incoming, setIncoming]     = useState<Booking[]>([])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [ridesRes, incomingRes, bookingsRes] = await Promise.all([
          getMyRides(),
          getIncomingBookings(),
          getMyBookings(),
        ])
        setMyRides(ridesRes.data)
        setIncoming(incomingRes.data)
        setMyBookings(bookingsRes.data)
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleConfirm = async (id: string) => {
    try {
      await confirmBooking(id)
      setIncoming(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b)
      )
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm')
    }
  }

  const handleCancelBooking = async (id: string) => {
    try {
      await cancelBooking(id)
      setMyBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
      )
      setIncoming(prev =>
        prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
      )
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel')
    }
  }

  const handleCancelRide = async (id: string) => {
    try {
      await cancelRide(id)
      setMyRides(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
      )
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel ride')
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'my-rides',    label: 'My rides',          count: myRides.length },
    { key: 'incoming',    label: 'Incoming bookings',  count: incoming.filter(b => b.status === 'pending').length },
    { key: 'my-bookings', label: 'My bookings',        count: myBookings.length },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {user?.name}
          </p>
        </div>
        <Link href="/rides/new">
          <Button>+ Offer a ride</Button>
        </Link>
      </div>

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
              transition-colors
              ${tab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
              }
            `}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`
                text-xs rounded-full px-1.5 py-0.5 font-medium
                ${tab === t.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-300 text-slate-600'
                }
              `}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div
              key={i}
              className="bg-white border rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* ── my rides ── */}
      {!loading && tab === 'my-rides' && (
        <div className="space-y-4">
          {myRides.length === 0 ? (
            <EmptyState
              message="You haven't posted any rides yet"
              action={{ label: 'Offer a ride', href: '/rides/new' }}
            />
          ) : (
            myRides.map(ride => (
              <div key={ride.id} className="relative">
                <RideCard ride={ride} />
                {ride.status === 'active' && (
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelRide(ride.id)}
                    >
                      Cancel ride
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── incoming bookings ── */}
      {!loading && tab === 'incoming' && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <EmptyState message="No bookings on your rides yet" />
          ) : (
            incoming.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isDriver={true}
                onConfirm={handleConfirm}
                onCancel={handleCancelBooking}
              />
            ))
          )}
        </div>
      )}

      {/* ── my bookings ── */}
      {!loading && tab === 'my-bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <EmptyState
              message="You haven't booked any rides yet"
              action={{ label: 'Find a ride', href: '/rides' }}
            />
          ) : (
            myBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isDriver={false}
                onCancel={handleCancelBooking}
              />
            ))
          )}
        </div>
      )}

    </div>
  )
}

// ── empty state helper ───────────────────────────────────────
function EmptyState({
  message,
  action,
}: {
  message: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="text-center py-16">
      <p className="text-slate-400 mb-4">{message}</p>
      {action && (
        <Link href={action.href}>
          <Button variant="outline">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}