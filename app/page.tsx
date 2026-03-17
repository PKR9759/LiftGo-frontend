// app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HomePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    from: '',
    to: '',
    date: '',
    seats: '1',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      from:  form.from,
      to:    form.to,
      date:  form.date,
      seats: form.seats,
    })
    router.push(`/rides?${params.toString()}`)
  }

  return (
    <div>
      {/* hero */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Share the ride, split the cost
          </h1>
          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto">
            Find drivers heading your way or offer empty seats on your route.
          </p>

          {/* search form */}
          <form
            onSubmit={handleSearch}
            className="bg-slate-50 border rounded-xl p-6 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-4"
          >
            <div className="text-left">
              <Label htmlFor="from" className="text-xs text-slate-500 mb-1 block">
                From
              </Label>
              <Input
                id="from"
                placeholder="Mumbai"
                value={form.from}
                onChange={e => setForm({ ...form, from: e.target.value })}
                required
              />
            </div>

            <div className="text-left">
              <Label htmlFor="to" className="text-xs text-slate-500 mb-1 block">
                To
              </Label>
              <Input
                id="to"
                placeholder="Pune"
                value={form.to}
                onChange={e => setForm({ ...form, to: e.target.value })}
                required
              />
            </div>

            <div className="text-left">
              <Label htmlFor="date" className="text-xs text-slate-500 mb-1 block">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="text-left">
              <Label htmlFor="seats" className="text-xs text-slate-500 mb-1 block">
                Seats
              </Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="8"
                value={form.seats}
                onChange={e => setForm({ ...form, seats: e.target.value })}
              />
            </div>

            <div className="sm:col-span-4">
              <Button type="submit" className="w-full">
                Search rides
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* how it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Search a route',
              desc:  'Enter where you are going and when. We find drivers on the same route.',
            },
            {
              step: '02',
              title: 'Book a seat',
              desc:  'Pick a ride that fits your schedule and request a seat in seconds.',
            },
            {
              step: '03',
              title: 'Share the journey',
              desc:  'Meet your driver, travel together, and rate each other after.',
            },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="text-4xl font-bold text-slate-200 mb-3">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}