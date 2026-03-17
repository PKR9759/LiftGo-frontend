// components/RideCard.tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Ride } from '@/types'
import { format } from 'date-fns'

interface Props {
  ride: Ride
}

export default function RideCard({ ride }: Props) {
  const departure = new Date(ride.departure_at)

  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">

        {/* route */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">{ride.origin_city}</span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-900">{ride.destination_city}</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {ride.origin_address} → {ride.destination_address}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{format(departure, 'dd MMM yyyy')}</span>
            <span className="text-slate-300">·</span>
            <span>{format(departure, 'hh:mm a')}</span>
            <span className="text-slate-300">·</span>
            <span>{ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left</span>
          </div>
        </div>

        {/* price + action */}
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-slate-900 mb-1">
            ₹{ride.price_per_seat}
          </p>
          <p className="text-xs text-slate-400 mb-3">per seat</p>
          <Link href={`/rides/${ride.id}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>

      </div>

      {/* driver row */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center
            text-xs font-medium text-slate-600">
            {ride.driver_name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-slate-600">{ride.driver_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-sm text-slate-600">
            {ride.driver_avg_rating > 0 ? ride.driver_avg_rating.toFixed(1) : 'New'}
          </span>
          {ride.driver_total_reviews > 0 && (
            <span className="text-xs text-slate-400">
              ({ride.driver_total_reviews})
            </span>
          )}
        </div>
      </div>

      {/* notes */}
      {ride.notes && (
        <p className="mt-3 text-xs text-slate-400 italic">"{ride.notes}"</p>
      )}

      {/* status badge — only show if not active */}
      {ride.status !== 'active' && (
        <div className="mt-3">
          <Badge variant={ride.status === 'full' ? 'secondary' : 'destructive'}>
            {ride.status}
          </Badge>
        </div>
      )}
    </div>
  )
}