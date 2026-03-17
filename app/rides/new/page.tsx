// app/rides/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createRide } from '@/lib/api'

const schema = z.object({
  origin_city:         z.string().min(2, 'Required'),
  destination_city:    z.string().min(2, 'Required'),
  origin_address:      z.string().min(5, 'Enter a full address'),
  destination_address: z.string().min(5, 'Enter a full address'),
  departure_at:        z.string().min(1, 'Pick a date and time'),
  total_seats:         z.coerce.number().min(1).max(8),
  price_per_seat:      z.coerce.number().min(0),
  notes:               z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewRidePage() {
  const router = useRouter()
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { total_seats: 1, price_per_seat: 0 },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    setLoading(true)
    try {
      // convert local datetime to ISO 8601
      const iso = new Date(data.departure_at).toISOString()
      const res = await createRide({ ...data, departure_at: iso })
      router.push(`/rides/${res.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post ride')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Offer a ride</h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in your route details and we'll match you with riders
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* cities */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Route</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <Label className="text-sm mb-1 block">From city</Label>
              <Input
                placeholder="Mumbai"
                {...register('origin_city')}
              />
              {errors.origin_city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.origin_city.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 block">To city</Label>
              <Input
                placeholder="Pune"
                {...register('destination_city')}
              />
              {errors.destination_city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.destination_city.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 block">Pickup address</Label>
              <Input
                placeholder="Bandra West, Mumbai"
                {...register('origin_address')}
              />
              {errors.origin_address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.origin_address.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 block">Drop-off address</Label>
              <Input
                placeholder="Koregaon Park, Pune"
                {...register('destination_address')}
              />
              {errors.destination_address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.destination_address.message}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* date + seats + price */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Trip details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="sm:col-span-3">
              <Label className="text-sm mb-1 block">Departure date and time</Label>
              <Input
                type="datetime-local"
                {...register('departure_at')}
              />
              {errors.departure_at && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.departure_at.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 block">Available seats</Label>
              <Input
                type="number"
                min={1}
                max={8}
                {...register('total_seats')}
              />
              {errors.total_seats && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.total_seats.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm mb-1 block">Price per seat (₹)</Label>
              <Input
                type="number"
                min={0}
                placeholder="350"
                {...register('price_per_seat')}
              />
              {errors.price_per_seat && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price_per_seat.message}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* notes */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">
            Notes{' '}
            <span className="text-slate-400 font-normal text-sm">(optional)</span>
          </h2>
          <Textarea
            placeholder="AC car, no smoking, one stop allowed..."
            className="resize-none"
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Posting ride...' : 'Post ride'}
        </Button>

      </form>
    </div>
  )
}