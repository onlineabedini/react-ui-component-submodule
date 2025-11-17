"use client";
// ClickableInfoTooltip: Reusable click-based info tooltip with editable content
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClickableInfoTooltipProps {
  /**
   * Translation key for the tooltip content
   */
  translationKey: string;
  /**
   * Fallback text if translation is not available
   */
  fallbackText?: string;
  /**
   * Position of the tooltip relative to the icon
   * @default 'right'
   */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * Additional CSS classes for the icon
   */
  iconClassName?: string;
  /**
   * Additional CSS classes for the tooltip content
   */
  tooltipClassName?: string;
}

/**
 * ClickableInfoTooltip Component
 * 
 * A reusable info tooltip that:
 * - Opens on click instead of hover
 * - Closes when clicking outside
 * - Has data-editable span for content editing
 * - Supports right-click properly
 * - Accessible with keyboard (Enter/Space to toggle)
 */
const ClickableInfoTooltip: React.FC<ClickableInfoTooltipProps> = ({
  translationKey,
  fallbackText = '',
  position = 'bottom',
  iconClassName = '',
  tooltipClassName = '',
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [usePortal, setUsePortal] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  

  // Close tooltip when clicking outside (but not on right-click/context menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore right-clicks (context menu)
      if (event.button === 2) return;
      
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Toggle tooltip on click
  const toggleTooltip = (e: React.MouseEvent) => {
    // Only left click toggles (allows right-click to work properly)
    if (e.button === 0) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  // Detect if any ancestor would clip the tooltip (overflow hidden/scroll/auto/clip)
  const hasClippingAncestor = (node: HTMLElement | null) => {
    let el = node?.parentElement;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const values = [style.overflow, style.overflowX, style.overflowY];
      if (values.some(v => ['hidden', 'auto', 'scroll', 'clip'].includes(v))) {
        return true;
      }
      el = el.parentElement as HTMLElement | null;
    }
    return false;
  };

  // Compute viewport coordinates for portal rendering
  const updatePortalPosition = () => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportPadding = 8;
    const tooltipWidth = 288; // w-72
    const tooltipHeight = 120; // estimate

    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    if (position === 'top') {
      top = rect.top - tooltipHeight - 8;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (position === 'left') {
      top = rect.top;
      left = rect.left - tooltipWidth - 8;
    } else if (position === 'right') {
      top = rect.top;
      left = rect.right + 8;
    }

    const maxLeft = window.innerWidth - tooltipWidth - viewportPadding;
    const maxTop = window.innerHeight - tooltipHeight - viewportPadding;
    left = Math.max(viewportPadding, Math.min(left, maxLeft));
    top = Math.max(viewportPadding, Math.min(top, maxTop));
    setCoords({ top, left });
  };

  // When opening, decide whether to portal and, if so, track position
  useEffect(() => {
    if (!isOpen) {
      setUsePortal(false);
      return;
    }
    const shouldPortal = hasClippingAncestor(containerRef.current);
    setUsePortal(shouldPortal);
    if (!shouldPortal) return;
    updatePortalPosition();
    const onResize = () => updatePortalPosition();
    const onScroll = () => updatePortalPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, position]);

  // Position classes for absolute tooltip relative to the icon/container
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'absolute left-1/2 bottom-full -translate-x-1/2 mb-2';
      case 'bottom':
        return 'absolute left-1/2 top-full -translate-x-1/2 mt-2';
      case 'left':
        return 'absolute right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
      default:
        return 'absolute left-full top-1/2 -translate-y-1/2 ml-2';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative inline-block"
    >
      {/* Info Icon Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleTooltip}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => {
          // Only prevent context menu on the icon itself, not on editable content
          const target = e.target as HTMLElement;
          if (!target.hasAttribute('data-editable') && !target.closest('[data-editable]')) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className={`mx-2 inline-flex items-center justify-center w-5 h-5 ${
          isOpen ? 'text-teal-400' : 'text-teal-600'
        } hover:text-teal-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 rounded ${iconClassName}`}
        aria-label="Toggle information"
        aria-expanded={isOpen}
      >
        <Info className="w-5 h-5" />
      </button>

      {/* Tooltip Content */}
      {isOpen && (!usePortal ? (
        <div 
          className={`${getPositionClasses()} z-[9998] w-72 px-4 py-3 text-sm text-teal-900 bg-white border border-teal-500 rounded-lg shadow-xl shadow-teal-100 animate-fade-in ${tooltipClassName}`}
          onContextMenu={(e) => {
            // Allow context menu on editable content
            const target = e.target as HTMLElement;
            if (target.hasAttribute('data-editable') || target.closest('[data-editable]')) {
              return; // Let the event propagate for editable content
            }
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            onContextMenu={(e) => {
              // Prevent context menu on the close button only
              e.stopPropagation();
              e.preventDefault();
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close tooltip"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span 
            data-editable 
            data-key={translationKey}
            className="block pr-6 cursor-pointer px-2 py-1 rounded transition-colors hover:bg-teal-50"
            style={{ pointerEvents: 'auto' }}
          >
            {t(translationKey) || fallbackText}
          </span>
        </div>
      ) : (
        createPortal(
          <div 
            className={`fixed z-[9998] w-72 px-4 py-3 text-sm text-teal-900 bg-white border border-teal-500 rounded-lg shadow-xl shadow-teal-100 animate-fade-in ${tooltipClassName}`}
            style={{ top: coords?.top ?? 0, left: coords?.left ?? 0 }}
            onContextMenu={(e) => {
              // Allow context menu on editable content
              const target = e.target as HTMLElement;
              if (target.hasAttribute('data-editable') || target.closest('[data-editable]')) {
                return; // Let the event propagate for editable content
              }
            }}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              onContextMenu={(e) => {
                // Prevent context menu on the close button only
                e.stopPropagation();
                e.preventDefault();
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close tooltip"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span 
              data-editable 
              data-key={translationKey}
              className="block pr-6 cursor-pointer px-2 py-1 rounded transition-colors hover:bg-teal-50"
              style={{ pointerEvents: 'auto' }}
            >
              {t(translationKey) || fallbackText}
            </span>
          </div>,
          document.body
        )
      ))}

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ClickableInfoTooltip;

