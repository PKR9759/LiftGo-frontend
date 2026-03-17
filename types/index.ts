// types/index.ts

export interface User {
    id: string
    name: string
    email: string
    phone?: string
    avatar_url?: string
    avg_rating: number
    total_reviews: number
    role: 'rider' | 'driver' | 'both'
    created_at: string
  }
  
  export interface Ride {
    id: string
    driver_id: string
    driver_name: string
    driver_avg_rating: number
    driver_total_reviews: number
    origin_city: string
    destination_city: string
    origin_address: string
    destination_address: string
    departure_at: string
    total_seats: number
    available_seats: number
    price_per_seat: number
    notes?: string
    status: 'active' | 'full' | 'cancelled' | 'completed'
    created_at: string
  }
  
  export interface Booking {
    id: string
    ride_id: string
    rider_id: string
    rider_name: string
    driver_name: string
    origin_city: string
    destination_city: string
    departure_at: string
    seats: number
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    total_price: number
    created_at: string
  }
  
  export interface Review {
    id: string
    booking_id: string
    reviewer_id: string
    reviewer_name: string
    reviewee_id: string
    rating: number
    comment?: string
    created_at: string
  }
  
  export interface AuthResponse {
    token: string
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }