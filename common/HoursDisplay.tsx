"use client";
// HoursDisplay: Reusable component for displaying hours with consistent formatting
import React from 'react';
import { formatHours } from '@/utils/formatHours';

interface HoursDisplayProps {
  /**
   * The number of hours to display
   */
  hours: number | null | undefined;
  /**
   * Whether to show the "h" or "hours" suffix
   * @default true
   */
  showSuffix?: boolean;
  /**
   * The suffix text to display (e.g., "h", "hours", "hr")
   * @default "h"
   */
  suffix?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

/**
 * HoursDisplay Component
 * 
 * A reusable component for displaying hours with consistent formatting.
 * Automatically formats whole numbers and decimals appropriately.
 * 
 * @example
 * <HoursDisplay hours={1.5} suffix="hours" />
 * // Renders: "1.5 hours"
 * 
 * <HoursDisplay hours={2} />
 * // Renders: "2h"
 */
const HoursDisplay: React.FC<HoursDisplayProps> = ({
  hours,
  showSuffix = true,
  suffix = 'h',
  className = '',
  style,
}) => {
  const formattedHours = formatHours(hours);

  return (
    <span className={className} style={style}>
      {formattedHours}
      {showSuffix && formattedHours !== '—' && ` ${suffix}`}
    </span>
  );
};

export default HoursDisplay;

