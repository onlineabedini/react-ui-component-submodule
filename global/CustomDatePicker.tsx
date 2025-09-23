import { formatDateEuropean } from "@/lib/utils";
import { addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isBefore, startOfDay } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  value: any;
  onChange: (date: any) => void;
  placeholder: string;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if today is still bookable (before 5 PM)
  const isTodayBookable = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour < 17; // Before 5 PM
  };

  const predefinedRanges = [
    { 
      label: "Today", 
      getDates: () => ({ startDate: new Date(), endDate: new Date() }),
      disabled: !isTodayBookable()
    },
    { 
      label: "Tomorrow", 
      getDates: () => ({ startDate: addDays(new Date(), 1), endDate: addDays(new Date(), 1) }),
      disabled: false
    },
    { 
      label: "This week", 
      getDates: () => ({ startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), endDate: endOfWeek(new Date(), { weekStartsOn: 1 }) }),
      disabled: false
    },
    { 
      label: "This month", 
      getDates: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }),
      disabled: false
    },
  ];

  const handlePredefinedRange = (range: typeof predefinedRanges[0]) => {
    if (range.disabled) return;
    
    const dates = range.getDates();
    setDateRange(dates);
    onChange([formatDateEuropean(dates.startDate), formatDateEuropean(dates.endDate)]);
    setIsOpen(false);
  };

  // Check if a date is in the past (before today)
  const isDateInPast = (date: Date): boolean => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  const handleDateClick = (date: Date) => {
    // Prevent selecting past dates
    if (isDateInPast(date)) {
      return;
    }

    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      setDateRange({ startDate: date, endDate: null });
    } else {
      if (date < dateRange.startDate) {
        setDateRange({ startDate: date, endDate: dateRange.startDate });
      } else {
        setDateRange({ startDate: dateRange.startDate, endDate: date });
      }
    }
  };

  const handleConfirm = () => {
    if (dateRange.startDate && dateRange.endDate) {
      onChange([formatDateEuropean(dateRange.startDate), formatDateEuropean(dateRange.endDate)]);
      setIsOpen(false);
    }
  };

  const isInRange = (date: Date) => {
    if (!dateRange.startDate || !dateRange.endDate) return false;
    return date >= dateRange.startDate && date <= dateRange.endDate;
  };

  const isStartDate = (date: Date) => {
    return dateRange.startDate && isSameDay(date, dateRange.startDate);
  };

  const isEndDate = (date: Date) => {
    return dateRange.endDate && isSameDay(date, dateRange.endDate);
  };

  const getCalendarDays = (month: Date) => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const displayValue = () => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${format(dateRange.startDate, 'yyyy-MM-dd')} ~ ${format(dateRange.endDate, 'yyyy-MM-dd')}`;
    }
    return placeholder;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <input
          type="text"
          value={displayValue()}
        placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 cursor-pointer"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 min-w-[750px]">
          <div className="flex gap-8">
            {/* Left Sidebar - Predefined Ranges */}
            <div className="w-36">
              <h3 className="text-gray-900 text-sm font-semibold mb-4 text-center pb-2 border-b border-gray-100">Quick Select</h3>
              <div className="space-y-3">
                {predefinedRanges.map((range, index) => (
                  <button
                    key={index}
                    onClick={() => handlePredefinedRange(range)}
                    disabled={range.disabled}
                    className={`
                      w-full text-left text-sm py-2 px-3 rounded-lg transition-all duration-200 font-medium
                      ${range.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                      }
                    `}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Dual Calendar */}
            <div className="flex gap-6">
              {/* Left Calendar */}
              <div className="w-68">
                <div className="flex items-center justify-between mb-4 px-2">
                  <button
                    onClick={prevMonth}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-gray-900 font-semibold text-base">
                    {format(currentMonth, 'MMM yyyy').toUpperCase()}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3 px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-gray-600 text-xs font-medium text-center py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 px-2">
                  {getCalendarDays(currentMonth).map((date, index) => {
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isRangeStart = isStartDate(date);
                    const isRangeEnd = isEndDate(date);
                    const inRange = isInRange(date);
                    const isPast = isDateInPast(date);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => setHoverDate(date)}
                        onMouseLeave={() => setHoverDate(null)}
                        disabled={isPast}
                        className={`
                          w-10 h-10 text-sm rounded-lg transition-all duration-200 font-medium
                          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                          ${isPast ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
                          ${isRangeStart ? 'bg-teal-500 text-white rounded-r-none shadow-md' : ''}
                          ${isRangeEnd ? 'bg-teal-500 text-white rounded-l-none shadow-md' : ''}
                          ${inRange && !isRangeStart && !isRangeEnd ? 'bg-teal-100 text-teal-900 rounded-none' : ''}
                          ${!inRange && isCurrentMonth && !isPast ? 'hover:bg-gray-100 hover:shadow-sm' : ''}
                          ${dateRange.startDate && !dateRange.endDate && hoverDate && date > dateRange.startDate && date <= hoverDate ? 'bg-teal-200 text-teal-900 rounded-none' : ''}
                          ${dateRange.startDate && !dateRange.endDate && hoverDate && date < dateRange.startDate && date >= hoverDate ? 'bg-teal-200 text-teal-900 rounded-none' : ''}
                        `}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Calendar */}
              <div className="w-68">
                <div className="flex items-center justify-between mb-4 px-2">
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-gray-900 font-semibold text-base">
                    {format(addMonths(currentMonth, 1), 'MMM yyyy').toUpperCase()}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 2))}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3 px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-gray-600 text-xs font-medium text-center py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 px-2">
                  {getCalendarDays(addMonths(currentMonth, 1)).map((date, index) => {
                    const isCurrentMonth = isSameMonth(date, addMonths(currentMonth, 1));
                    const isRangeStart = isStartDate(date);
                    const isRangeEnd = isEndDate(date);
                    const inRange = isInRange(date);
                    const isPast = isDateInPast(date);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => setHoverDate(date)}
                        onMouseLeave={() => setHoverDate(null)}
                        disabled={isPast}
                        className={`
                          w-10 h-10 text-sm rounded-lg transition-all duration-200 font-medium
                          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                          ${isPast ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
                          ${isRangeStart ? 'bg-teal-500 text-white rounded-r-none shadow-md' : ''}
                          ${!inRange && isCurrentMonth && !isPast ? 'hover:bg-gray-100 hover:shadow-sm' : ''}
                          ${isRangeEnd ? 'bg-teal-500 text-white rounded-l-none shadow-md' : ''}
                          ${inRange && !isRangeStart && !isRangeEnd ? 'bg-teal-100 text-teal-900 rounded-none' : ''}
                          ${dateRange.startDate && !dateRange.endDate && hoverDate && date > dateRange.startDate && date <= hoverDate ? 'bg-teal-200 text-teal-900 rounded-none' : ''}
                          ${dateRange.startDate && !dateRange.endDate && hoverDate && date < dateRange.startDate && date >= hoverDate ? 'bg-teal-200 text-teal-900 rounded-none' : ''}
                        `}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!dateRange.startDate || !dateRange.endDate}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;