"use client";
// BookmarkButton: Button to toggle provider favorites
import React, { useState, useEffect } from 'react';
import { clientService } from '@/services/client.service';
import { BookmarkStatus } from '@/types/bookmark';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  clientId: string;
  providerId: string;
  onToggle?: () => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'overlay' | 'card' | 'default';
}

// Favorite button component for toggling provider favorites
const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  clientId,
  providerId,
  onToggle,
  className = '',
  size = 'default',
  variant = 'default'
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Check initial bookmark status
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const status: BookmarkStatus = await clientService.checkBookmarkStatus(clientId, providerId);
        setIsBookmarked(status.isBookmarked);
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      } finally {
        setInitialized(true);
      }
    };

    if (clientId && providerId) {
      checkBookmarkStatus();
    }
  }, [clientId, providerId]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
    
    if (!clientId || !providerId) return;
    
    setLoading(true);
    try {
      if (isBookmarked) {
        await clientService.removeBookmark(clientId, providerId);
        setIsBookmarked(false);
        toast.success('Bookmark removed successfully');
      } else {
        await clientService.bookmarkProvider(clientId, providerId);
        setIsBookmarked(true);
        toast.success('Provider bookmarked successfully');
      }
      onToggle?.();
    } catch (error) {
      console.error('Bookmark operation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Bookmark operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'overlay':
        return `
          w-10 h-10 p-0 rounded-full 
          backdrop-blur-md bg-white/90 hover:bg-white 
          border border-white/50 shadow-lg hover:shadow-xl
          text-gray-600 hover:text-yellow-500
          transition-all duration-300 hover:scale-110
          ${isBookmarked ? 'bg-yellow-50 text-yellow-500 border-yellow-200' : ''}
        `;
      case 'card':
        return `
          w-8 h-8 p-0 rounded-full 
          bg-white/95 hover:bg-white 
          border border-gray-200/50 shadow-md hover:shadow-lg
          text-gray-500 hover:text-yellow-500
          transition-all duration-300 hover:scale-110
          ${isBookmarked ? 'bg-yellow-50 text-yellow-500 border-yellow-200' : ''}
        `;
      default:
        return `
          hover:scale-105 transition-all duration-200
          ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-500 hover:text-yellow-500'}
        `;
    }
  };

  // Get icon size based on button size and variant
  const getIconSize = () => {
    if (variant === 'overlay') return 'h-5 w-5';
    if (variant === 'card') return 'h-4 w-4';
    
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };

  // Don't render until initialized to prevent flickering
  if (!initialized) {
    return (
      <Button
        variant={variant === 'overlay' || variant === 'card' ? 'ghost' : 'ghost'}
        size={variant === 'overlay' || variant === 'card' ? 'icon' : size}
        className={`animate-pulse ${getVariantStyles()} ${className}`}
        disabled
      >
        <Heart className={getIconSize()} />
      </Button>
    );
  }

  return (
    <button
      onClick={handleBookmarkToggle}
      aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
      className={
        variant === 'overlay'
          ? `bg-white/80 rounded-full p-2 shadow-md hover:bg-pink-100 transition-colors duration-200 ${isBookmarked ? 'text-pink-500' : 'text-gray-400'} ${isBookmarked ? 'favorite-active' : ''}`
          : `flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-pink-50 transition-colors duration-200 ${isBookmarked ? 'text-pink-500' : 'text-gray-400'} ${isBookmarked ? 'favorite-active' : ''}`
      }
      title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
      // Tooltip for clarity
      data-tooltip={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* Heart icon for favorite status, with animation and shadow when active */}
      <span className={`relative flex items-center justify-center ${isBookmarked ? 'animate-favorite-bounce' : ''}`}>
        <Heart className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-200 ${isBookmarked ? 'fill-pink-500 text-pink-500 drop-shadow-favorite' : 'text-gray-400'}`} fill={isBookmarked ? 'currentColor' : 'none'} />
        {/* Animated colored shadow for active state */}
        {isBookmarked && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-200 via-pink-100 to-white opacity-60 blur-sm -z-10 animate-favorite-glow" />
        )}
      </span>
      {/* Optionally show text for non-overlay variant */}
      {variant !== 'overlay' && (
        <span>{isBookmarked ? 'Favorited' : 'Add to Favorites'}</span>
      )}
      {/* Tooltip styling */}
      <style>{`
        [data-tooltip]:hover:after {
          content: attr(data-tooltip);
          position: absolute;
          left: 50%;
          top: 110%;
          transform: translateX(-50%);
          background: rgba(30, 41, 59, 0.95);
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 50;
          pointer-events: none;
        }
        .drop-shadow-favorite {
          filter: drop-shadow(0 0 8px #ec4899aa);
        }
        .favorite-active {
          background: linear-gradient(90deg, #fce7f3 0%, #fbcfe8 100%);
          border-color: #f9a8d4 !important;
        }
        .animate-favorite-bounce {
          animation: favorite-bounce 0.5s;
        }
        @keyframes favorite-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.25); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .animate-favorite-glow {
          animation: favorite-glow 1.5s infinite alternate;
        }
        @keyframes favorite-glow {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </button>
  );
};

export default BookmarkButton; 