"use client";
// ProviderReviews: Displays provider reviews from latest reports with comments
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Report } from '@/types/report';
import { API_BASE_URL } from '@/config/api';
import DOMPurify from 'dompurify';

// Props for the ProviderReviews component
interface ProviderReviewsProps {
  providerId: string;
  maxReviews?: number;
  showTitle?: boolean;
}

// Interface for enhanced report data with client info
interface EnhancedReport extends Report {
  clientName?: string;
  clientAvatar?: string;
  serviceDate: string; // Required since we always set it
}

const ProviderReviews: React.FC<ProviderReviewsProps> = ({ 
  providerId, 
  maxReviews = 5, 
  showTitle = true 
}) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<EnhancedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch provider reviews from reports
  const fetchProviderReviews = async () => {
    if (!providerId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch reports for this provider
      const response = await fetch(`${API_BASE_URL}/reports/provider/${providerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const allReports: Report[] = await response.json();
      
      // Filter reports with comments and client acceptance
      const reviewsWithComments = allReports.filter(report => 
        report.comment && 
        report.comment.trim() !== '' && 
        report.clientAccept && 
        report.providerAccept
      );

      // Sort by creation date (latest first)
      const sortedReviews = reviewsWithComments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxReviews);

      // Enhance reports with client information
      const enhancedReviews = await Promise.all(
        sortedReviews.map(async (report) => {
          try {
            // Fetch client information
            const clientResponse = await fetch(`${API_BASE_URL}/client/${report.clientId}`);
            if (clientResponse.ok) {
              const clientData = await clientResponse.json();
                           return {
               ...report,
               clientName: clientData.firstName || clientData.username || 'Anonymous',
               clientAvatar: clientData.profileImage,
               serviceDate: report.createdAt || new Date().toISOString()
             };
            }
            return {
              ...report,
              clientName: 'Anonymous',
              serviceDate: report.createdAt || new Date().toISOString()
            };
          } catch (error) {
            return {
              ...report,
              clientName: 'Anonymous',
              serviceDate: report.createdAt || new Date().toISOString()
            };
          }
        })
      );

      setReviews(enhancedReviews);
      setTotalReviews(reviewsWithComments.length);

      // Calculate average rating
      if (reviewsWithComments.length > 0) {
        const totalRating = reviewsWithComments.reduce((sum, report) => sum + report.rate, 0);
        setAverageRating(Math.round((totalRating / reviewsWithComments.length) * 10) / 10);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('[Provider Reviews Error]', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews on component mount
  useEffect(() => {
    fetchProviderReviews();
  }, [providerId, maxReviews]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-gray-600">{t('loadingReviews')}</span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{t('errorLoadingReviews')}</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  // Handle no reviews state
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">{t('noReviewsYet')}</p>
        <p className="text-sm">{t('beFirstToReview')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-current" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {t('providerReviews.title')}
            </h2>
          </div>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-500">{averageRating}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">
              {totalReviews} {totalReviews === 1 ? t('review') : t('reviews')}
            </span>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('providerReviews.subtitle')}
          </p>
        </motion.div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
                  {review.clientAvatar ? (
                    <img 
                      src={review.clientAvatar} 
                      alt={review.clientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rate)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
                             <div className="flex items-center gap-1 text-gray-500 text-sm">
                 <Calendar className="w-4 h-4" />
                 <span>
                   {new Date(review.serviceDate).toLocaleDateString()}
                 </span>
               </div>
            </div>

            {/* Review Comment */}
            <div className="mb-4">
              <div 
                className="text-gray-700 italic leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.comment || '') }}
              />
            </div>

            {/* Review Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{t('verifiedReview')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{review.rate}/5</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Reviews Link */}
      {totalReviews > maxReviews && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center pt-6"
        >
          <button className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200">
            {t('viewAllReviews')} ({totalReviews})
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProviderReviews;
