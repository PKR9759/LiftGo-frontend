// components/BookingCard.tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types'
import { format } from 'date-fns'

interface Props {
  booking: Booking
  onConfirm?: (id: string) => void
  onCancel?:  (id: string) => void
  isDriver?:  boolean
}

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending:   'outline',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
}

export default function BookingCard({
  booking,
  onConfirm,
  onCancel,
  isDriver = false,
}: Props) {
  const departure = new Date(booking.departure_at)

  return (
    <div className="bg-white border rounded-xl p-5">

      {/* route */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">
              {booking.origin_city}
            </span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-900">
              {booking.destination_city}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {format(departure, 'dd MMM yyyy')} · {format(departure, 'hh:mm a')}
          </p>
        </div>
        <Badge variant={statusColor[booking.status]}>
          {booking.status}
        </Badge>
      </div>

      {/* meta row */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
        <span>
          {isDriver ? `Rider: ${booking.rider_name}` : `Driver: ${booking.driver_name}`}
        </span>
        <span className="text-slate-300">·</span>
        <span>{booking.seats} seat{booking.seats !== 1 ? 's' : ''}</span>
        <span className="text-slate-300">·</span>
        <span className="font-medium text-slate-900">₹{booking.total_price}</span>
      </div>

      {/* actions */}
      <div className="flex gap-2 flex-wrap">
        <Link href={`/bookings/${booking.id}`}>
          <Button variant="outline" size="sm">View details</Button>
        </Link>

        {/* driver: confirm pending booking */}
        {isDriver && booking.status === 'pending' && onConfirm && (
          <Button
            size="sm"
            onClick={() => onConfirm(booking.id)}
          >
            Confirm
          </Button>
        )}

        {/* both: cancel if not already done */}
        {['pending', 'confirmed'].includes(booking.status) && onCancel && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}