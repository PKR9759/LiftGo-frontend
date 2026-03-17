// components/ReviewStars.tsx

'use client'

interface Props {
    rating:   number
    max?:     number
    size?:    'sm' | 'md' | 'lg'
    onChange?: (rating: number) => void
  }
  
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }
  
  export default function ReviewStars({
    rating,
    max = 5,
    size = 'md',
    onChange,
  }: Props) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(i + 1)}
            className={`
              ${sizes[size]}
              ${onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              ${i < rating ? 'text-yellow-400' : 'text-slate-200'}
            `}
          >
            ★
          </button>
        ))}
      </div>
    )
  }