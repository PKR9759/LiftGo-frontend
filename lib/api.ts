// lib/api.ts
import axios from 'axios'
import { getToken } from './auth'
import type {
  AuthResponse, User, Ride, Booking, Review
} from '@/types'

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// attach JWT to every request automatically
client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── auth ─────────────────────────────────────────────────────
export const register = (data: {
  name: string; email: string; password: string
  phone?: string; role?: string
}) => client.post<AuthResponse>('/api/auth/register', data)

export const login = (data: {
  email: string; password: string
}) => client.post<AuthResponse>('/api/auth/login', data)

// ── users ─────────────────────────────────────────────────────
export const getMe = () =>
  client.get<User>('/api/users/me')

export const updateMe = (data: Partial<User>) =>
  client.put<User>('/api/users/me', data)

export const getUserReviews = (userID: string) =>
  client.get<Review[]>(`/api/users/${userID}/reviews`)

// ── rides ─────────────────────────────────────────────────────
export const searchRides = (params: {
  from: string; to: string; date?: string; seats?: number
}) => client.get<Ride[]>('/api/rides', { params })

export const getRide = (id: string) =>
  client.get<Ride>(`/api/rides/${id}`)

export const getMyRides = () =>
  client.get<Ride[]>('/api/rides/mine')

export const createRide = (data: {
  origin_city: string; destination_city: string
  origin_address: string; destination_address: string
  departure_at: string; total_seats: number
  price_per_seat: number; notes?: string
}) => client.post<Ride>('/api/rides', data)

export const updateRide = (id: string, data: Partial<Ride>) =>
  client.put<Ride>(`/api/rides/${id}`, data)

export const cancelRide = (id: string) =>
  client.delete(`/api/rides/${id}`)

// ── bookings ──────────────────────────────────────────────────
export const createBooking = (data: {
  ride_id: string; seats: number
}) => client.post<Booking>('/api/bookings', data)

export const getMyBookings = () =>
  client.get<Booking[]>('/api/bookings/mine')

export const getIncomingBookings = () =>
  client.get<Booking[]>('/api/bookings/incoming')

export const getBooking = (id: string) =>
  client.get<Booking>(`/api/bookings/${id}`)

export const confirmBooking = (id: string) =>
  client.put<Booking>(`/api/bookings/${id}/confirm`)

export const cancelBooking = (id: string) =>
  client.put<Booking>(`/api/bookings/${id}/cancel`)

// ── reviews ───────────────────────────────────────────────────
export const createReview = (data: {
  booking_id: string; reviewee_id: string
  rating: number; comment?: string
}) => client.post<Review>('/api/reviews', data)