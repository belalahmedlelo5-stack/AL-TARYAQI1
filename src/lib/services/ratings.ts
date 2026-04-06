// ============================================
// RATINGS & REVIEWS SERVICE
// ============================================

import { supabase } from '@/lib/supabase';
import { validateReview } from '@/lib/validation/antiBypass';
import type { Review } from '@/types/database';

export interface ReviewWithDetails extends Review {
  reviewer: {
    id: string;
    name: string;
    avatar_url: string | null;
    verification_badge: string | null;
  };
}

/**
 * Get reviews for a user (supplier or buyer)
 */
export async function getUserReviews(userId: string): Promise<ReviewWithDetails[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(id, name, avatar_url, verification_badge)
    `)
    .eq('reviewee_id', userId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  
  return data as ReviewWithDetails[];
}

/**
 * Check if user can review an order
 */
export async function canReviewOrder(
  orderId: string,
  userId: string
): Promise<{ canReview: boolean; reason?: string }> {
  // Check if order is completed
  const { data: order, error } = await supabase
    .from('orders')
    .select('status, buyer_id, accepted_supplier_id')
    .eq('id', orderId)
    .single();
  
  if (error || !order) {
    return { canReview: false, reason: 'الطلب غير موجود' };
  }
  
  if (order.status !== 'completed') {
    return { canReview: false, reason: 'يمكن التقييم فقط بعد اكتمال الطلب' };
  }
  
  // Check if user is buyer or supplier
  if (order.buyer_id !== userId && order.accepted_supplier_id !== userId) {
    return { canReview: false, reason: 'لا يمكنك تقييم هذا الطلب' };
  }
  
  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('order_id', orderId)
    .eq('reviewer_id', userId)
    .single();
  
  if (existingReview) {
    return { canReview: false, reason: 'لقد قمت بالتقييم مسبقاً' };
  }
  
  return { canReview: true };
}

/**
 * Submit a review
 */
export async function submitReview(reviewData: {
  orderId: string;
  reviewerId: string;
  rating: number;
  reviewText: string;
}): Promise<{ success: boolean; error?: string }> {
  // Validate content
  const validation = validateReview(reviewData.rating, reviewData.reviewText);
  if (!validation.isValid) {
    return { success: false, error: validation.errors[0] };
  }
  
  // Check if can review
  const canReviewCheck = await canReviewOrder(reviewData.orderId, reviewData.reviewId);
  if (!canReviewCheck.canReview) {
    return { success: false, error: canReviewCheck.reason };
  }
  
  // Get order to determine reviewee
  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id, accepted_supplier_id')
    .eq('id', reviewData.orderId)
    .single();
  
  if (!order) {
    return { success: false, error: 'الطلب غير موجود' };
  }
  
  // Determine reviewee (the other party)
  const revieweeId = order.buyer_id === reviewData.reviewerId 
    ? order.accepted_supplier_id 
    : order.buyer_id;
  
  if (!revieweeId) {
    return { success: false, error: 'لا يمكن تحديد الطرف الآخر' };
  }
  
  // Submit review
  const { error } = await supabase
    .from('reviews')
    .insert({
      order_id: reviewData.orderId,
      reviewer_id: reviewData.reviewerId,
      reviewee_id: revieweeId,
      rating: reviewData.rating,
      review_text: reviewData.reviewText,
    });
  
  if (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: 'فشل إرسال التقييم' };
  }
  
  return { success: true };
}

/**
 * Get rating summary for a user
 */
export async function getRatingSummary(userId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', userId)
    .eq('is_visible', true);
  
  if (error || !reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
  
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round((sum / total) * 10) / 10,
    totalReviews: total,
    ratingDistribution: distribution,
  };
}

// ============================================
// REACT COMPONENTS
// ============================================

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  interactive = false,
  onRatingChange 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: ReviewWithDetails;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.reviewer.avatar_url ? (
              <img 
                src={review.reviewer.avatar_url} 
                alt={review.reviewer.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-lg">{review.reviewer.name[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.reviewer.name}</span>
              {review.reviewer.verification_badge && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  ✓ {review.reviewer.verification_badge === 'verified_supplier' ? 'مورد موثق' : 'مشتري موثق'}
                </span>
              )}
            </div>
            <div className="text-gray-400 text-sm">
              {new Date(review.created_at).toLocaleDateString('ar-EG')}
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      
      {review.review_text && (
        <p className="text-gray-600 text-sm leading-relaxed">{review.review_text}</p>
      )}
    </div>
  );
}

interface ReviewFormProps {
  orderId: string;
  onSubmit: (rating: number, reviewText: string) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({ orderId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('يرجى اختيار تقييم');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(rating, reviewText);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">قيّم التعامل</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التقييم
        </label>
        <StarRating 
          rating={rating} 
          size="lg" 
          interactive 
          onRatingChange={setRating}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          التعليق (اختياري)
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="شارك تجربتك مع الطرف الآخر..."
        />
      </div>
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}

interface RatingSummaryProps {
  userId: string;
}

export function RatingSummary({ userId }: RatingSummaryProps) {
  const [summary, setSummary] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  } | null>(null);
  
  React.useEffect(() => {
    getRatingSummary(userId).then(setSummary);
  }, [userId]);
  
  if (!summary || summary.totalReviews === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Star className="w-4 h-4" />
        <span className="text-sm">لا توجد تقييمات</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        <span className="font-bold text-lg">{summary.averageRating}</span>
      </div>
      <span className="text-gray-400 text-sm">({summary.totalReviews} تقييم)</span>
    </div>
  );
}
