// app/rides/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getRide, createBooking } from '@/lib/api'
import { isLoggedIn, getUser } from '@/lib/auth'
import type { Ride } from '@/types'
import { format } from 'date-fns'

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)
  const [seats, setSeats] = useState(1)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const currentUser = getUser()
  const loggedIn = isLoggedIn()
  const isDriver = currentUser?.id === ride?.driver_id

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRide(id)
        setRide(res.data)
      } catch {
        setError('Ride not found')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleBook = async () => {
    if (!loggedIn) {
      router.push('/auth/login')
      return
    }
    setError('')
    setBooking(true)
    try {
      const res = await createBooking({ ride_id: id, seats })
      setSuccess('Booking requested! Check your dashboard.')
      setTimeout(() => router.push(`/bookings/${res.data.id}`), 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-slate-400 text-lg">Ride not found</p>
      </div>
    )
  }

  const departure = new Date(ride.departure_at)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* route header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {ride.origin_city} → {ride.destination_city}
          </h1>
          {ride.status !== 'active' && (
            <Badge variant={ride.status === 'full' ? 'secondary' : 'destructive'}>
              {ride.status}
            </Badge>
          )}
        </div>
        <p className="text-slate-500 text-sm">
          {format(departure, 'EEEE, dd MMMM yyyy')} at {format(departure, 'hh:mm a')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* main info */}
        <div className="sm:col-span-2 space-y-4">

          {/* route detail */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Route details</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="w-0.5 h-8 bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{ride.origin_city}</p>
                    <p className="text-xs text-slate-400">{ride.origin_address}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{ride.destination_city}</p>
                    <p className="text-xs text-slate-400">{ride.destination_address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* driver info */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Driver</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center
                  justify-center font-medium text-slate-600">
                  {ride.driver_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{ride.driver_name}</p>
                  <p className="text-xs text-slate-400">
                    {ride.driver_total_reviews} review{ride.driver_total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-medium text-slate-900">
                  {ride.driver_avg_rating > 0
                    ? ride.driver_avg_rating.toFixed(1)
                    : 'New'}
                </span>
              </div>
            </div>
          </div>

          {/* notes */}
          {ride.notes && (
            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-slate-900 mb-2">Notes from driver</h2>
              <p className="text-slate-500 text-sm">{ride.notes}</p>
            </div>
          )}

        </div>

        {/* booking panel */}
        <div className="sm:col-span-1">
          <div className="bg-white border rounded-xl p-5 sticky top-24">
            <p className="text-2xl font-bold text-slate-900 mb-1">
              ₹{ride.price_per_seat}
            </p>
            <p className="text-xs text-slate-400 mb-4">per seat</p>

            <p className="text-sm text-slate-500 mb-4">
              {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} available
            </p>

            {/* seats input */}
            {!isDriver && ride.status === 'active' && (
              <>
                <div className="mb-4">
                  <Label className="text-xs text-slate-500 mb-1 block">
                    Seats to book
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={ride.available_seats}
                    value={seats}
                    onChange={e => setSeats(parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-slate-500">Total</span>
                  <span className="font-semibold text-slate-900">
                    ₹{(ride.price_per_seat * seats).toFixed(0)}
                  </span>
                </div>
              </>
            )}

            {/* error / success */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-green-600 text-xs">{success}</p>
              </div>
            )}

            {/* action button */}
            {isDriver ? (
              <p className="text-xs text-slate-400 text-center">
                This is your ride
              </p>
            ) : ride.status !== 'active' ? (
              <p className="text-xs text-slate-400 text-center">
                This ride is {ride.status}
              </p>
            ) : (
              <Button
                className="w-full"
                onClick={handleBook}
                disabled={booking || seats < 1 || seats > ride.available_seats}
              >
                {booking ? 'Booking...' : loggedIn ? 'Request seat' : 'Log in to book'}
              </Button>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}