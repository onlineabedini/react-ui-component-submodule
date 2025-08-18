// @collapse
// __dev
"use client";
// LatestReviewsSection: Displays random latest report comments from the platform
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar, User, Quote } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Report } from '@/types/report';
import { API_BASE_URL } from '@/config/api';
import DOMPurify from 'dompurify';

// Interface for enhanced report data with user info
interface EnhancedReport extends Report {
  clientName?: string;
  providerName?: string;
  clientAvatar?: string;
  providerAvatar?: string;
  serviceDate: string; // Required since we always set it
}

const LatestReviewsSection: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<EnhancedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch random latest reviews from the platform
  const fetchLatestReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all reports from the platform
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const allReports: Report[] = await response.json();
      
      // Filter reports with comments and full acceptance
      const reviewsWithComments = allReports.filter(report => 
        report.comment && 
        report.comment.trim() !== '' && 
        report.clientAccept && 
        report.providerAccept
      );

      // Sort by creation date (latest first) and take random selection
      const sortedReviews = reviewsWithComments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20); // Take top 20 latest reviews

      // Shuffle and take first 6 for display
      const shuffledReviews = sortedReviews
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);

      // Enhance reports with user information
      const enhancedReviews = await Promise.all(
        shuffledReviews.map(async (report) => {
          try {
            // Fetch client information
            const clientResponse = await fetch(`${API_BASE_URL}/client/${report.clientId}`);
            let clientData = null;
            if (clientResponse.ok) {
              clientData = await clientResponse.json();
            }

            // Fetch provider information if available
            let providerData = null;
            if (report.providerId) {
              try {
                const providerResponse = await fetch(`${API_BASE_URL}/provider/${report.providerId}`);
                if (providerResponse.ok) {
                  providerData = await providerResponse.json();
                }
              } catch (error) {
                // Provider data not critical, continue without it
              }
            }

                         return {
               ...report,
               clientName: clientData?.firstName || clientData?.username || 'Anonymous',
               providerName: providerData?.firstName || providerData?.username || 'Provider',
               clientAvatar: clientData?.profileImage,
               providerAvatar: providerData?.profileImage,
               serviceDate: report.createdAt || new Date().toISOString()
             };
                     } catch (error) {
             return {
               ...report,
               clientName: 'Anonymous',
               providerName: 'Provider',
               serviceDate: report.createdAt || new Date().toISOString()
             };
           }
        })
      );

      setReviews(enhancedReviews);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('[Latest Reviews Error]', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews on component mount
  useEffect(() => {
    fetchLatestReviews();
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-3 text-gray-600">{t('loadingReviews')}</span>
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-8 text-red-600">
            <p>{t('errorLoadingReviews')}</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Handle no reviews state
  if (reviews.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-medium">{t('noReviewsAvailable')}</p>
            <p className="text-sm">{t('checkBackLater')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              {t('latestReviews.title')}
            </h2>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('latestReviews.subtitle')}
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center opacity-20">
                <Quote className="w-4 h-4 text-white" />
              </div>

              {/* Review Content */}
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rate)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {review.rate}/5
                  </span>
                </div>

                {/* Comment */}
                <blockquote className="text-gray-700 italic leading-relaxed mb-6 text-lg">
                  <div 
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.comment || '') }}
                  />
                </blockquote>

                {/* User Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
                      {review.clientAvatar ? (
                        <img 
                          src={review.clientAvatar} 
                          alt={review.clientName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                      <p className="text-sm text-gray-500">
                        {t('reviewed')} {review.providerName}
                      </p>
                    </div>
                  </div>
                  
                                     {/* Date */}
                   <div className="flex items-center gap-1 text-gray-500 text-sm">
                     <Calendar className="w-4 h-4" />
                     <span>
                       {new Date(review.serviceDate).toLocaleDateString()}
                     </span>
                   </div>
                </div>

                {/* Verified Badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                  <MessageCircle className="w-3 h-3" />
                  <span>{t('verifiedReview')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center pt-12"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('latestReviews.cta.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('latestReviews.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-200 hover:scale-105 shadow-lg">
                {t('latestReviews.cta.bookService')}
              </button>
              <button className="bg-transparent border-2 border-teal-300 text-teal-700 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all duration-200">
                {t('latestReviews.cta.becomeProvider')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LatestReviewsSection;
