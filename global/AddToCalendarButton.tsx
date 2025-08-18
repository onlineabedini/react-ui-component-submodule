"use client";
// AddToCalendarButton: Button to add a job to user's calendar (Google, Outlook, Apple, .ics)
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaRegCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Props for the AddToCalendarButton
export interface AddToCalendarButtonProps {
  title: string; // Event title
  description?: string; // Event description
  location?: string; // Event location
  startDate: string; // ISO string or 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endDate: string; // ISO string or 'YYYY-MM-DD'
  endTime: string; // 'HH:mm'
}

// Validate calendar props
function validateCalendarProps(props: AddToCalendarButtonProps): boolean {
  // Check if all required fields exist
  if (!props.title || !props.startDate || !props.startTime || !props.endDate || !props.endTime) {
    return false;
  }
  
  // Validate date formats
  try {
    const startDate = new Date(props.startDate);
    const endDate = new Date(props.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }
    
    // Validate time formats (should be HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(props.startTime) || !timeRegex.test(props.endTime)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Format date/time to YYYYMMDDTHHmmssZ (UTC) for calendar links
function formatDateTimeForCalendar(date: string, time: string) {
  try {
    // Validate date format
    if (!date || !time) {
      throw new Error('Invalid date or time');
    }
    
    // Ensure date is in YYYY-MM-DD format
    let dateStr = date;
    if (date.includes('T')) {
      dateStr = date.split('T')[0];
    } else if (date.includes(' ')) {
      dateStr = date.split(' ')[0];
    }
    
    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new Error('Invalid date format');
    }
    
    // Ensure time is in HH:mm format
    let timeStr = time;
    if (time.includes('T')) {
      timeStr = time.split('T')[1]?.split('.')[0] || time;
    } else if (time.includes(' ')) {
      timeStr = time.split(' ')[1] || time;
    }
    
    // Validate time format (should be HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeStr)) {
      throw new Error('Invalid time format');
    }
    
    // Create date string in ISO format
    const dateTimeString = `${dateStr}T${timeStr}`;
    const d = new Date(dateTimeString);
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch (error) {
    console.error('Error formatting date for calendar:', error);
    // Return current date/time as fallback
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

// Generate Google Calendar link
function getGoogleCalendarUrl({ title, description, location, startDate, startTime, endDate, endTime }: AddToCalendarButtonProps) {
  const start = formatDateTimeForCalendar(startDate, startTime);
  const end = formatDateTimeForCalendar(endDate, endTime);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description || '',
    location: location || '',
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook Calendar link
function getOutlookCalendarUrl({ title, description, location, startDate, startTime, endDate, endTime }: AddToCalendarButtonProps) {
  const start = formatDateTimeForCalendar(startDate, startTime);
  const end = formatDateTimeForCalendar(endDate, endTime);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    body: description || '',
    location: location || '',
    startdt: start,
    enddt: end,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Generate .ics file content
function generateICS({ title, description, location, startDate, startTime, endDate, endTime }: AddToCalendarButtonProps) {
  const start = formatDateTimeForCalendar(startDate, startTime);
  const end = formatDateTimeForCalendar(endDate, endTime);
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${description || ''}\nLOCATION:${location || ''}\nDTSTART:${start}\nDTEND:${end}\nEND:VEVENT\nEND:VCALENDAR`;
}

// Download .ics file
function downloadICSFile(props: AddToCalendarButtonProps) {
  const icsContent = generateICS(props).replace(/\n/g, '\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Main AddToCalendarButton component: renders calendar export options
const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = (props) => {
  const { t } = useTranslation();
  
  // Debug logging
  console.log('AddToCalendarButton props:', {
    title: props.title,
    startDate: props.startDate,
    startTime: props.startTime,
    endDate: props.endDate,
    endTime: props.endTime
  });
  
  // Validate props before rendering
  if (!validateCalendarProps(props)) {
    console.warn('Calendar props validation failed:', props);
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs font-semibold text-gray-700 mb-1">{t('addEventTo')}</span>
        <div className="text-sm text-red-500">
          {t('calendar.invalidData') || 'Invalid calendar data'}
        </div>
      </div>
    );
  }
  
  // Short comment: Render visually distinct calendar export buttons
  return (
    <div className="flex flex-col items-start gap-1">
      {/* Add event to label */}
      <span className="text-xs font-semibold text-gray-700 mb-1">{t('addEventTo')}</span>
      <div className="flex gap-3 items-center">
        {/* Google Calendar Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-2 border-[#4285F4] text-[#4285F4] bg-white rounded-full px-5 py-2 shadow-md hover:bg-[#e8f0fe] hover:border-[#4285F4] hover:shadow-lg transition-all duration-200 font-semibold"
          asChild
        >
          <a href={getGoogleCalendarUrl(props)} target="_blank" rel="noopener noreferrer">
            <FaGoogle className="w-5 h-5" /> {t('calendar.google')}
          </a>
        </Button>
        {/* Outlook Calendar Button (fallback to calendar icon) */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-2 border-[#0072C6] text-[#0072C6] bg-white rounded-full px-5 py-2 shadow-md hover:bg-[#e6f0fa] hover:border-[#0072C6] hover:shadow-lg transition-all duration-200 font-semibold"
          asChild
        >
          <a href={getOutlookCalendarUrl(props)} target="_blank" rel="noopener noreferrer">
            <FaRegCalendarAlt className="w-5 h-5" /> {t('calendar.outlook')}
          </a>
        </Button>
        {/* ICS File Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-2 border-[#34A853] text-[#34A853] bg-white rounded-full px-5 py-2 shadow-md hover:bg-[#e6f9ed] hover:border-[#34A853] hover:shadow-lg transition-all duration-200 font-semibold"
          onClick={() => downloadICSFile(props)}
        >
          <FaRegCalendarAlt className="w-5 h-5" /> {t('calendar.ics')}
        </Button>
      </div>
    </div>
  );
};

export default AddToCalendarButton; 