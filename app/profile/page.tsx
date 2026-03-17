// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReviewStars from '@/components/ReviewStars'
import { getMe, updateMe, getUserReviews } from '@/lib/api'
import { setAuth, getToken } from '@/lib/auth'
import type { User, Review } from '@/types'

const schema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role:  z.enum(['rider', 'driver', 'both']),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const [user, setUser]       = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMe()
        setUser(res.data)
        reset({
          name:  res.data.name,
          phone: res.data.phone ?? '',
          role:  res.data.role as 'rider' | 'driver' | 'both',
        })
        const rvRes = await getUserReviews(res.data.id)
        setReviews(rvRes.data)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onSubmit = async (data: FormData) => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await updateMe(data)
      setUser(res.data)
      // update stored user name
      const token = getToken()
      if (token) setAuth(token, res.data)
      setSuccess('Profile updated')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-1/3" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

      {/* header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center
          justify-center text-white text-xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <ReviewStars rating={user?.avg_rating ?? 0} size="sm" />
            <span className="text-sm text-slate-500">
              {user?.avg_rating ?? 0} · {user?.total_reviews} review
              {user?.total_reviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* edit form */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Edit profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <Label className="text-sm mb-1 block">Full name</Label>
            <Input {...register('name')} />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm mb-1 block">Phone</Label>
            <Input type="tel" {...register('phone')} />
          </div>

          <div>
            <Label className="text-sm mb-2 block">I want to</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['rider', 'driver', 'both'] as const).map(r => (
                <label key={r} className="relative cursor-pointer">
                  <input
                    type="radio"
                    value={r}
                    {...register('role')}
                    className="peer sr-only"
                  />
                  <div className="text-center border rounded-lg py-2 text-sm
                    text-slate-600 peer-checked:border-slate-900
                    peer-checked:bg-slate-900 peer-checked:text-white
                    transition-colors capitalize">
                    {r === 'both' ? 'Both' : r === 'rider' ? 'Find rides' : 'Offer rides'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>

        </form>
      </div>

      {/* reviews received */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-4">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(rv => (
              <div key={rv.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    {rv.reviewer_name}
                  </span>
                  <ReviewStars rating={rv.rating} size="sm" />
                </div>
                {rv.comment && (
                  <p className="text-sm text-slate-500">{rv.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}