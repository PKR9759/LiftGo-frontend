// app/rides/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import RideCard from '@/components/RideCard'
import { searchRides } from '@/lib/api'
import type { Ride } from '@/types'

export default function RidesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    from:  searchParams.get('from')  || '',
    to:    searchParams.get('to')    || '',
    date:  searchParams.get('date')  || '',
    seats: searchParams.get('seats') || '1',
  })

  const fetchRides = async () => {
    if (!form.from || !form.to) return
    setLoading(true)
    setError('')
    try {
      const res = await searchRides({
        from:  form.from,
        to:    form.to,
        date:  form.date,
        seats: parseInt(form.seats),
      })
      setRides(res.data)
    } catch {
      setError('Failed to fetch rides. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // fetch on mount if params exist
  useEffect(() => {
    if (form.from && form.to) fetchRides()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      from:  form.from,
      to:    form.to,
      date:  form.date,
      seats: form.seats,
    })
    router.push(`/rides?${params.toString()}`)
    fetchRides()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* search bar */}
      <div className="bg-white border rounded-xl p-4 mb-8">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">From</Label>
            <Input
              placeholder="Mumbai"
              value={form.from}
              onChange={e => setForm({ ...form, from: e.target.value })}
              required
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">To</Label>
            <Input
              placeholder="Pune"
              value={form.to}
              onChange={e => setForm({ ...form, to: e.target.value })}
              required
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Seats</Label>
            <Input
              type="number"
              min="1"
              max="8"
              value={form.seats}
              onChange={e => setForm({ ...form, seats: e.target.value })}
            />
          </div>
          <div className="col-span-2 sm:col-span-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>
      </div>

      {/* results header */}
      {(form.from && form.to) && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {form.from} → {form.to}
          </h2>
          <span className="text-sm text-slate-500">
            {rides.length} ride{rides.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* rides list */}
      {!loading && rides.length > 0 && (
        <div className="space-y-4">
          {rides.map(ride => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}

      {/* empty state */}
      {!loading && rides.length === 0 && form.from && form.to && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-2">No rides found</p>
          <p className="text-slate-400 text-sm">
            Try a different date or check back later
          </p>
        </div>
      )}

      {/* initial state — no search yet */}
      {!form.from && !form.to && (
        <div className="text-center py-20">
          <p className="text-slate-400">Enter a route above to find rides</p>
        </div>
      )}

    </div>
  )
}