// app/bookings/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ReviewStars from "@/components/ReviewStars";
import { getBooking, createReview, getUserReviews } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { Booking, Review } from "@/types";
import { format } from "date-fns";

const statusColor: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  confirmed: "default",
  cancelled: "destructive",
  completed: "secondary",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = getUser();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBooking(id);
        setBooking(res.data);

        // figure out who we are reviewing
        // if current user is the rider → they review the driver
        // if current user is the driver → they review the rider
        const revieweeID =
          currentUser?.id === res.data.rider_id
            ? res.data.rider_id // rider reviews driver
            : res.data.rider_id; // driver reviews rider

        // check if already reviewed
        const rvRes = await getUserReviews(revieweeID);
        setReviews(rvRes.data);

        const alreadyReviewed = rvRes.data.some(
          (r) => r.reviewer_id === currentUser?.id && r.booking_id === id
        );
        setReviewed(alreadyReviewed);
      } catch {
        setError("Booking not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReview = async () => {
    if (!booking) return;
    setReviewError("");
    setSubmitting(true);

    // rider reviews driver, driver reviews rider
    const revieweeID =
      currentUser?.id === booking.rider_id
        ? booking.rider_id // ← was wrong before, now correct
        : booking.rider_id;

    try {
      await createReview({
        booking_id: id,
        reviewee_id: revieweeID,
        rating,
        comment,
      });
      setReviewed(true);
    } catch (err: any) {
      setReviewError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-slate-400 text-lg">{error || "Booking not found"}</p>
      </div>
    );
  }

  const departure = new Date(booking.departure_at);
  const canReview = ["confirmed", "completed"].includes(booking.status);
  const isRider = currentUser?.id === booking.rider_id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900">Booking details</h1>
          <Badge variant={statusColor[booking.status]}>{booking.status}</Badge>
        </div>
        <p className="text-slate-500 text-sm">
          Booked on {format(new Date(booking.created_at), "dd MMM yyyy")}
        </p>
      </div>

      {/* route card */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Route</h2>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="w-0.5 h-8 bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-slate-900 text-sm">
                {booking.origin_city}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">
                {booking.destination_city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* trip info */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Trip info</h2>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-slate-500">Date</span>
          <span className="text-slate-900 font-medium">
            {format(departure, "dd MMM yyyy")}
          </span>

          <span className="text-slate-500">Time</span>
          <span className="text-slate-900 font-medium">
            {format(departure, "hh:mm a")}
          </span>

          <span className="text-slate-500">Seats booked</span>
          <span className="text-slate-900 font-medium">{booking.seats}</span>

          <span className="text-slate-500">Total paid</span>
          <span className="text-slate-900 font-medium">
            ₹{booking.total_price}
          </span>

          <span className="text-slate-500">{isRider ? "Driver" : "Rider"}</span>
          <span className="text-slate-900 font-medium">
            {isRider ? booking.driver_name : booking.rider_name}
          </span>
        </div>
      </div>

      {/* review section */}
      {canReview && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-1">Leave a review</h2>
          <p className="text-slate-500 text-sm mb-4">
            Rate your experience with{" "}
            {
              currentUser?.id === booking.rider_id
                ? booking.driver_name 
                : booking.rider_name 
            }
          </p>

          {reviewed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-green-700 text-sm">
                Review submitted — thank you!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block">Rating</Label>
                <ReviewStars rating={rating} size="lg" onChange={setRating} />
              </div>

              <div>
                <Label className="text-sm mb-1 block">
                  Comment{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  placeholder="How was the ride?"
                  className="resize-none"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {reviewError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-red-600 text-sm">{reviewError}</p>
                </div>
              )}

              <Button
                onClick={handleReview}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit review"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
