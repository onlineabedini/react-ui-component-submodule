//@collapse
// Custom time picker component - Simple design
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  minTime?: string;
  maxTime?: string;
  step?: number;
  className?: string;
  availableTimes?: string[];
  isGeneralRequest?: boolean;
  disabled?: boolean;
  disabledTimes?: string[];
  'data-testid'?: string;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  minTime = '00:00',
  maxTime = '23:59',
  step = 5,
  className = '',
  availableTimes = [],
  isGeneralRequest = false,
  disabled = false,
  disabledTimes = [],
  'data-testid': dataTestId,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize selected time from value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate hours for 24-hour format
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate all minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Check if a time is available
  const isTimeAvailable = (hour: number, minute: number) => {
    if (isGeneralRequest) return true;
    
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (disabledTimes.includes(time)) {
      return false;
    }
    
    if (availableTimes.length > 0) {
      return availableTimes.includes(time);
    }
    
    return true;
  };

  // Handle time selection
  const handleTimeSelect = (hour: number, minute: number) => {
    if (!isTimeAvailable(hour, minute) || disabled) return;
    
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(newTime);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Input Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        data-testid={dataTestId}
        className={`flex items-center justify-between w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 [-webkit-appearance:none] [appearance:none] ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3">
            <div className="flex gap-3">
              {/* Hours Column */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Hours
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {hours.map((hour) => {
                    const isAvailable = isTimeAvailable(hour, selectedMinute);
                    const isSelected = selectedHour === hour;
                    return (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => handleTimeSelect(hour, selectedMinute)}
                        disabled={!isAvailable}
                        className={`w-full px-3 py-1.5 text-sm text-left ${
                          isSelected
                            ? 'bg-teal-500 text-white font-medium'
                            : isAvailable
                            ? 'hover:bg-gray-100 text-gray-900'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {hour.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Minutes
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {minutes.map((minute) => {
                    const isAvailable = isTimeAvailable(selectedHour, minute);
                    const isSelected = selectedMinute === minute;
                    return (
                      <button
                        key={minute}
                        type="button"
                        onClick={() => handleTimeSelect(selectedHour, minute)}
                        disabled={!isAvailable}
                        className={`w-full px-3 py-1.5 text-sm text-left ${
                          isSelected
                            ? 'bg-teal-500 text-white font-medium'
                            : isAvailable
                            ? 'hover:bg-gray-100 text-gray-900'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {minute.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker; 