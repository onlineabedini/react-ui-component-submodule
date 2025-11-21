"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Check, Pencil, Eye, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from '@/config/api';
import ServiceTypeDisplay from '@/components/common/ServiceTypeDisplay';
import StarRating from '@/components/common/StarRating';
import StatusTimeline, { StatusStep } from '@/components/common/StatusTimeline';
import AddToCalendarButton from '@/components/common/AddToCalendarButton';
import CustomTimePicker from '@/components/common/CustomTimePicker';
import { formatDateYYYYMMDD, formatDateEuropean } from '@/lib/utils';
import { Report } from '@/types/report';

type Job = {
  id: string;
  clientId: string;
  providerId: string;
  bookingDate: string[];
  typeOfService: string[];
  proposedStartTime: string;
  proposedEndTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  review: string | null;
  repeat: string | null;
  status: string;
  serviceAddress: string;
  responseTime: string;
  agreedHourlyPrice: number;
  totalPrice: string;
  finalPrice: string;
  stars: number;
  paymentSource: string[];
  paymentDestination: string[];
  transactionMeta: string[];
  expectBring?: boolean;
  createdAt: string;
  clientAccept?: boolean;
  providerAccept?: boolean;
  clientAcceptTimestamp?: string;
  providerAcceptTimestamp?: string;
  volunteerProviders?: string[];
};

type LatestJobsListProps = {
  jobsList: Job[];
  emptyMsg: string;
  role: 'client' | 'provider';
  clientId: string | null;
  providerId: string | null;
  clientProfiles: Record<string, any>;
  providerProfiles: Record<string, any>;
  editingJob: Job | null;
  editForm: Partial<Job>;
  editLoading: boolean;
  processingAcceptId: string | null;
  selectingVolunteerId: string | null;
  volunteersByBooking: Record<string, string[]>;
  loadingVolunteers: Record<string, boolean>;
  expandedTimelines: Record<string, boolean>;
  reports: Record<string, Report[]>;
  onAcceptJob: (jobId: string, role: 'client' | 'provider') => void;
  onEditClick: (job: Job) => void;
  onEditFormChange: (field: keyof Job, value: any) => void;
  onEditSave: (role: 'client' | 'provider') => void;
  onEditCancel: () => void;
  onSelectVolunteer: (bookingId: string, selectedProviderId: string) => void;
  onFetchVolunteers: (bookingId: string) => void;
  onProviderClick: (providerId: string) => void;
  onToggleTimeline: (jobId: string) => void;
  onOpenReportDialog: (mode: 'create' | 'accept' | 'view', bookingId: string, existingReport?: Report) => void;
  onSummaryModalOpen: (job: Job) => void;
  onNavigate: (path: string) => void;
};

// Helper functions
const getServiceTypes = (typeOfService: any): string[] => {
  if (!typeOfService) return [];
  if (Array.isArray(typeOfService)) return typeOfService;
  if (typeof typeOfService === 'string') return [typeOfService];
  return [];
};

const normalizeServiceTypeKey = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1).replace(/\s+([a-z])/g, (match, letter) => letter.toUpperCase());
};

const formatDateChip = (dateStr: string) => {
  try {
    if (!dateStr) return '';
    return formatDateEuropean(dateStr);
  } catch {
    return formatDateYYYYMMDD(dateStr);
  }
};

const getFormattedDateChips = (bookingDate: string[]): string[] => {
  try {
    if (!Array.isArray(bookingDate)) return [];
    const chips = bookingDate
      .filter(d => typeof d === 'string' && d.trim().length > 0)
      .filter(d => {
        const parsed = new Date(d);
        return !isNaN(parsed.getTime());
      })
      .map(d => formatDateChip(d));
    return chips;
  } catch {
    return [];
  }
};

const getSafeDate = (bookingDate: string[], index: number = 0): string => {
  try {
    if (!Array.isArray(bookingDate) || bookingDate.length === 0) {
      return new Date().toISOString().split('T')[0];
    }
    let dateStr = '';
    if (index >= bookingDate.length) {
      dateStr = bookingDate[0];
    } else {
      dateStr = bookingDate[index];
    }
    if (!dateStr || typeof dateStr !== 'string') {
      return new Date().toISOString().split('T')[0];
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error in getSafeDate:', error);
    return new Date().toISOString().split('T')[0];
  }
};

const formatDateTime = (dateTimeStr: string) => {
  try {
    if (!dateTimeStr) return 'Invalid date';
    return formatDateYYYYMMDD(dateTimeStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const isValidDate = (dateStr: string): boolean => {
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

const isJobValidForCalendar = (job: Job): boolean => {
  try {
    return !!(
      job.bookingDate && 
      Array.isArray(job.bookingDate) && 
      job.bookingDate.length > 0 &&
      job.proposedStartTime &&
      isValidDate(getSafeDate(job.bookingDate))
    );
  } catch (error) {
    console.error('Error validating job for calendar:', error);
    return false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);
  const { t } = useTranslation();
  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 group relative"
      title={t('latestJobs.copyAddress')}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <svg className="w-4 h-4 text-gray-500 group-hover:text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

const LatestJobsList: React.FC<LatestJobsListProps> = ({
  jobsList,
  emptyMsg,
  role,
  clientId,
  providerId,
  clientProfiles,
  providerProfiles,
  editingJob,
  editForm,
  editLoading,
  processingAcceptId,
  selectingVolunteerId,
  volunteersByBooking,
  loadingVolunteers,
  expandedTimelines,
  reports,
  onAcceptJob,
  onEditClick,
  onEditFormChange,
  onEditSave,
  onEditCancel,
  onSelectVolunteer,
  onFetchVolunteers,
  onProviderClick,
  onToggleTimeline,
  onOpenReportDialog,
  onSummaryModalOpen,
  onNavigate,
}) => {
  const { t } = useTranslation();

  const getBookingReports = (bookingId: string): Report[] => {
    return reports[bookingId] || [];
  };

  const hasProviderReport = (bookingId: string): Report | null => {
    const bookingReports = getBookingReports(bookingId);
    return bookingReports.find(report => report.providerAccept) || null;
  };

  const hasClientAcceptedReport = (bookingId: string): boolean => {
    const bookingReports = getBookingReports(bookingId);
    return bookingReports.some(report => report.clientAccept);
  };

  const getCombinedStatus = (job: Job) => {
    if (job.clientAccept && job.providerAccept) {
      const hasReport = hasProviderReport(job.id);
      if (hasReport) {
        const clientAcceptedReport = hasClientAcceptedReport(job.id);
        return clientAcceptedReport ? t('latestJobs.statusValues.completed') : t('latestJobs.statusValues.waitingForRating');
      } else {
        return t('latestJobs.statusValues.jobInProgress');
      }
    } else if (job.clientAccept) {
      return t('latestJobs.statusValues.waitingForProvider');
    } else if (job.providerAccept) {
      return t('latestJobs.statusValues.waitingForClient');
    } else {
      return t('latestJobs.statusValues.pending');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'job in progress':
        return 'bg-blue-100 text-blue-800 animate-pulse';
      case 'waiting for rating':
        return 'bg-amber-100 text-amber-800';
      case 'waiting for provider':
      case 'waiting for client':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusHistory = (job: Job, userRole: 'client' | 'provider'): StatusStep[] => {
    const steps: StatusStep[] = [];
    
    steps.push({
      status: t('latestJobs.statusSteps.bookingCreated'),
      timestamp: job.createdAt,
      description: userRole === 'client' ? t('latestJobs.statusDescriptions.youCreatedRequest') : t('latestJobs.statusDescriptions.clientCreatedRequest'),
      isCompleted: true,
      isCurrent: false
    });

    if (job.clientAccept) {
      steps.push({
        status: t('latestJobs.statusSteps.clientAccepted'),
        timestamp: job.clientAcceptTimestamp || job.createdAt,
        description: userRole === 'client' ? t('latestJobs.statusDescriptions.youAcceptedRequest') : t('latestJobs.statusDescriptions.clientAcceptedRequest'),
        isCompleted: true,
        isCurrent: false
      });
    } else {
      steps.push({
        status: userRole === 'client' ? t('latestJobs.statusSteps.pleaseAcceptBooking') : t('latestJobs.statusSteps.waitingForClientAcceptance'),
        timestamp: job.createdAt,
        description: userRole === 'client' ? t('latestJobs.statusDescriptions.pleaseReviewAccept') : t('latestJobs.statusDescriptions.waitingForClientAccept'),
        isCompleted: false,
        isCurrent: true,
        needsCompletion: true
      });
    }

    if (job.providerAccept) {
      steps.push({
        status: t('latestJobs.statusSteps.providerAccepted'),
        timestamp: job.providerAcceptTimestamp || job.createdAt,
        description: userRole === 'provider' ? t('latestJobs.statusDescriptions.youAcceptedRequest') : t('latestJobs.statusDescriptions.providerAcceptedRequest'),
        isCompleted: true,
        isCurrent: false
      });
    } else {
      steps.push({
        status: userRole === 'provider' ? t('latestJobs.statusSteps.pleaseAcceptBooking') : t('latestJobs.statusSteps.waitingForProviderAcceptance'),
        timestamp: job.createdAt,
        description: userRole === 'provider' ? t('latestJobs.statusDescriptions.pleaseReviewAccept') : t('latestJobs.statusDescriptions.waitingForProviderAccept'),
        isCompleted: false,
        isCurrent: true,
        needsCompletion: true
      });
    }

    const providerReport = hasProviderReport(job.id);
    const clientAcceptedReport = hasClientAcceptedReport(job.id);
    
    if (providerReport) {
      steps.push({
        status: t('latestJobs.statusSteps.serviceReportCreated'),
        timestamp: providerReport.createdAt,
        description: userRole === 'provider' ? t('latestJobs.statusDescriptions.youCreatedReport') : t('latestJobs.statusDescriptions.providerCreatedReport'),
        isCompleted: true,
        isCurrent: false
      });

      if (clientAcceptedReport) {
        steps.push({
          status: t('latestJobs.statusSteps.serviceCompleted'),
          timestamp: providerReport.createdAt,
          description: userRole === 'client' ? t('latestJobs.statusDescriptions.youRatedAccepted') : t('latestJobs.statusDescriptions.clientRatedAccepted'),
          isCompleted: true,
          isCurrent: false
        });
      } else {
        steps.push({
          status: userRole === 'client' ? t('latestJobs.statusSteps.pleaseRateService') : t('latestJobs.statusSteps.waitingForClientRating'),
          timestamp: providerReport.createdAt,
          description: userRole === 'client' ? t('latestJobs.statusDescriptions.pleaseReviewRate') : t('latestJobs.statusDescriptions.waitingForClientRate'),
          isCompleted: false,
          isCurrent: true,
          needsCompletion: true
        });
      }
    } else if (job.clientAccept && job.providerAccept) {
      steps.push({
        status: t('latestJobs.statusSteps.serviceInProgress'),
        timestamp: new Date().toISOString(),
        description: userRole === 'provider'
          ? t('latestJobs.statusDescriptions.providerWorking')
          : t('latestJobs.statusDescriptions.clientWaiting'),
        isCompleted: false,
        isCurrent: true,
        needsCompletion: true
      });
    }

    return steps;
  };

  if (jobsList.length === 0) {
    return (
      <div className="text-gray-600 text-sm py-4">{emptyMsg}</div>
    );
  }

  return (
    <div className="space-y-6">
      {jobsList.map((job) => {
        const showAcceptAction =
          (role === 'client' && job.clientAccept === false) ||
          (role === 'provider' && job.providerAccept === false);
        const isFullyAccepted = job.clientAccept && job.providerAccept;
        const canEdit = (clientId && job.clientId === clientId) || (providerId && job.providerId === providerId);
        const hasReport = hasProviderReport(job.id);
        const isEditing = editingJob && editingJob.id === job.id;
        const canEditJob = canEdit && !hasReport && !(job.clientAccept && job.providerAccept);
        const providerReport = hasProviderReport(job.id);
        const clientAcceptedReport = hasClientAcceptedReport(job.id);
        const canCreateReport = role === 'provider' && !providerReport && isFullyAccepted;
        const canRespondToReport = role === 'client' && providerReport && !clientAcceptedReport;
        const canViewReport = providerReport && (clientAcceptedReport || role === 'provider');

        return (
          <div
            key={job.id}
            className={`relative p-5 border rounded-2xl bg-white/95 shadow-lg transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] flex flex-col gap-2 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-full ${
              clientAcceptedReport 
                ? 'bg-gradient-to-br from-green-50 to-white border-green-200 before:from-green-400 before:to-green-600 hover:from-green-100 hover:to-white' 
                : 'border-gray-100 before:from-teal-400 before:to-teal-600 hover:bg-gradient-to-br hover:from-teal-50 hover:to-white'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="mb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <ServiceTypeDisplay services={getServiceTypes(job.typeOfService).map(type => t(`latestJobs.tags.${normalizeServiceTypeKey(type)}`) || type)} variant="compact" className="font-semibold text-lg" />
                <div className="flex items-center gap-3 flex-1 justify-end">
                  {clientAcceptedReport && (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={hasProviderReport(job.id)?.rate || 0} starClassName="w-4 h-4" />
                      <span className="text-sm font-medium text-gray-600">({hasProviderReport(job.id)?.rate?.toFixed(1) || '0.0'})</span>
                    </div>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${clientAcceptedReport ? 'bg-green-100 text-green-800 flex items-center gap-1' : getStatusColor(getCombinedStatus(job))}`}>
                    {clientAcceptedReport ? <><Check className="w-3 h-3" /><Check className="w-3 h-3 -ml-2" /> <span data-editable data-key="latestJobs.completed">{t('latestJobs.completed')}</span></> : getCombinedStatus(job)}
                  </span>
                  <button
                    className="ml-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold hover:bg-teal-200 transition flex items-center gap-1"
                    onClick={() => onSummaryModalOpen(job)}
                  >
                    <Eye className="w-4 h-4 mr-1" /> <span data-editable data-key="latestJobs.showSummary">{t('latestJobs.showSummary')}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2 text-teal-500" />
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const chips = getFormattedDateChips(job.bookingDate);
                  if (chips.length > 0) {
                    return chips.map((label, idx) => (
                      <span key={`${job.id}-date-${idx}`} className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {label}
                      </span>
                    ));
                  }
                  return (
                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                      {formatDateTime(getSafeDate(job.bookingDate))}
                    </span>
                  );
                })()}
              </div>
              <span className="mx-2 text-gray-400">|</span>
              <Clock className="w-4 h-4 mr-1 text-teal-500" />
              <span>{job.proposedStartTime}</span>
            </div>
            <div className="text-sm text-gray-600 mb-1 flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">📍</span> <span>{job.serviceAddress}</span>
                <CopyButton text={job.serviceAddress} />
              </div>
              <div className="flex items-center text-lg font-extrabold text-teal-800 ml-4 whitespace-nowrap">
                {t('latestJobs.currency', { value: job.totalPrice })}
              </div>
            </div>
            
            {job.expectBring && (
              <div className="text-sm text-gray-600 mb-1">
                <div className="flex items-center gap-2">
                  <span className="mr-2">📦</span>
                  <span className="font-medium"><span data-editable data-key="expectBring">{t('expectBring')}</span>:</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                    {t('expectBringDescription') || 'Provider should bring equipment and supplies'}
                  </span>
                </div>
              </div>
            )}
            
            {isFullyAccepted && isJobValidForCalendar(job) && (
              <div className="mt-2 mb-1">
                <AddToCalendarButton
                  title={t('latestJobs.calendarEventTitle', 'Vitago Job') + ` - ${getServiceTypes(job.typeOfService).map(type => t(`latestJobs.tags.${normalizeServiceTypeKey(type)}`) || type).join(', ')}`}
                  description={t('latestJobs.calendarEventDescription', 'Vitago job booking') + `\n${job.serviceAddress}`}
                  location={job.serviceAddress}
                  startDate={getSafeDate(job.bookingDate)}
                  startTime={job.proposedStartTime}
                  endDate={getSafeDate(job.bookingDate)}
                  endTime={undefined as any}
                />
              </div>
            )}
            
            {role === 'client' && !job.providerId && (
              <div className="mt-3 p-3 border rounded-xl bg-teal-50 border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-teal-800 font-semibold">
                    <UserPlus className="w-4 h-4" />
                    <span>{t('latestJobs.volunteers') || 'Volunteers'}</span>
                  </div>
                  <button
                    onClick={() => onFetchVolunteers(job.id)}
                    className="text-xs px-2 py-1 rounded-md bg-white text-teal-700 border border-teal-300 hover:bg-teal-100"
                    disabled={loadingVolunteers[job.id]}
                  >
                    {loadingVolunteers[job.id] ? (t('latestJobs.loading') || 'Loading...') : (t('latestJobs.refresh') || 'Refresh')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(volunteersByBooking[job.id] || job.volunteerProviders || []).length === 0 ? (
                    <span className="text-sm text-gray-600">{t('latestJobs.noVolunteersYet') || 'No volunteers yet'}</span>
                  ) : (
                    (volunteersByBooking[job.id] || job.volunteerProviders || []).map((vid) => (
                      <div
                        key={vid}
                        role="button"
                        tabIndex={0}
                        onClick={() => onProviderClick(vid)}
                        onKeyDown={(e) => { if (e.key === 'Enter') onProviderClick(vid); }}
                        className="flex items-center gap-2 bg-white border border-teal-200 rounded-lg p-2 cursor-pointer hover:bg-teal-50 transition-colors"
                      >
                        <img
                          src={providerProfiles[vid]?.profileImage ? `${API_BASE_URL}/${providerProfiles[vid].profileImage}` : "/assets/img/provider.jpg"}
                          alt="volunteer"
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{providerProfiles[vid]?.firstName} {providerProfiles[vid]?.lastName}</span>
                          <span className="text-xs text-gray-500">{t('latestJobs.volunteer') || 'Volunteer'}</span>
                        </div>
                        <button
                          className="ml-2 text-xs px-2 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-700"
                          onClick={(e) => { e.stopPropagation(); onSelectVolunteer(job.id, vid); }}
                        >
                          {t('latestJobs.choose') || 'Choose'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {isFullyAccepted && (
              <div 
                onClick={() => {
                  if (canCreateReport) {
                    onOpenReportDialog('create', job.id);
                  } else if (canRespondToReport) {
                    onOpenReportDialog('accept', job.id, providerReport);
                  } else if (canViewReport) {
                    onOpenReportDialog('view', job.id, providerReport);
                  }
                }}
                className={`
                  relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                  ${canCreateReport || canRespondToReport || canViewReport ? 'hover:scale-[1.02] hover:shadow-lg' : ''}
                  ${providerReport 
                    ? clientAcceptedReport 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg' 
                      : canRespondToReport 
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 animate-pulse shadow-lg ring-2 ring-amber-200' 
                        : 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
                    : canCreateReport 
                      ? 'bg-gradient-to-br from-teal-50 via-white to-teal-100 border-2 border-teal-200 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg ring-2 ring-blue-200'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent" />
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-teal-200/20 to-transparent rounded-full blur-2xl" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-teal-300/20 to-transparent rounded-full blur-2xl" />
                
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <span className={`
                      text-sm font-medium px-4 py-2 rounded-full transition-all duration-300
                      ${providerReport 
                        ? clientAcceptedReport 
                          ? 'bg-green-100 text-green-700 border-2 border-green-200 font-bold shadow-md' 
                          : canRespondToReport
                            ? 'bg-amber-100 text-amber-800 border-2 border-amber-400 font-bold shadow-md'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : canCreateReport
                          ? 'bg-gradient-to-r from-teal-100 via-white to-teal-50 text-teal-800 border-2 border-teal-200 font-bold shadow-md'
                          : 'bg-blue-100 text-blue-800 border-2 border-blue-400 font-bold shadow-md'
                      }
                    `}>
                      {(() => {
                        if (providerReport) {
                          if (clientAcceptedReport) {
                            return t('latestJobs.serviceCompletedAndRated');
                          } else if (role === 'client') {
                            return t('latestJobs.pleaseRateThisService');
                          } else {
                            return t('latestJobs.waitingForClientRating');
                          }
                        } else if (role === 'provider') {
                          return t('latestJobs.createServiceReport');
                        } else {
                          return t('latestJobs.serviceInProgress');
                        }
                      })()}
                    </span>
                    <div className="flex items-center gap-2">
                      {(canCreateReport || canRespondToReport) && (
                        <span className={`
                          text-xs font-bold px-2 py-1 rounded-full animate-bounce
                          ${canCreateReport ? 'bg-teal-200 text-teal-800' : 'bg-amber-200 text-amber-800'}
                        `}>
                          {role === 'provider' ? t('latestJobs.createReport') : t('latestJobs.rateNow')}
                        </span>
                      )}
                      <span className={`
                        text-xs transition-all duration-300
                        ${(canCreateReport || canRespondToReport) ? 'text-teal-700 font-bold' : 'text-gray-500'}
                      `}>
                        {(() => {
                          if (providerReport) {
                            if (clientAcceptedReport) {
                              return t('latestJobs.completed');
                            } else if (role === 'client') {
                              return t('latestJobs.yourActionRequired');
                            } else {
                              return t('latestJobs.waitingForClient');
                            }
                          } else if (role === 'provider') {
                            return t('latestJobs.yourActionRequired');
                          } else {
                            return t('latestJobs.providerIsWorkingOnIt');
                          }
                        })()}
                      </span>
                      {(canCreateReport || canRespondToReport || canViewReport) && (
                        <svg className={`
                          w-4 h-4 transition-all duration-300
                          ${(canCreateReport || canRespondToReport) ? 'text-teal-400 animate-pulse' : 'text-gray-400'}
                        `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {!providerReport && isFullyAccepted && (
                    <div className="mt-3 p-3 bg-teal-50/80 rounded-lg border border-teal-100">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-teal-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-teal-800 font-medium">
                            {role === 'client' 
                              ? t('latestJobs.clientServiceInProgress')
                              : t('latestJobs.providerServiceInProgress')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!providerReport && isFullyAccepted && (
                    <div className="flex justify-end mt-2">
                      <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                        <span data-editable data-key="latestJobs.active">{t('latestJobs.active')}</span>
                      </span>
                    </div>
                  )}

                  {clientAcceptedReport && (
                    <div className="mt-3 p-3 bg-green-50/80 rounded-lg border-2 border-green-200">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-green-800 font-medium">
                            {role === 'client' 
                              ? t('latestJobs.clientServiceCompleted')
                              : t('latestJobs.providerServiceCompleted')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="bg-gradient-to-br from-teal-50/50 to-white p-6 rounded-xl border border-teal-100 mb-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>{t('editJob.serviceType')}</Label>
                    <input 
                      type="text" 
                      value={editForm.typeOfService?.join(', ') || ''} 
                      onChange={(e) => onEditFormChange('typeOfService', e.target.value.split(', '))} 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400"
                      placeholder={t('latestJobs.enterServiceType')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('editJob.bookingDate')}</Label>
                    <input 
                      type="date" 
                      value={editForm.bookingDate && Array.isArray(editForm.bookingDate) && editForm.bookingDate.length > 0 ? getSafeDate(editForm.bookingDate) : ''} 
                      onChange={e => onEditFormChange('bookingDate', [e.target.value])} 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 outline-none text-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('editJob.proposedStartTime')}</Label>
                    <CustomTimePicker
                      value={editForm.proposedStartTime || ''}
                      onChange={(time) => onEditFormChange("proposedStartTime", time)}
                      minTime={"00:00"}
                      maxTime={"23:59"}
                      step={5}
                      className="w-full"
                      availableTimes={[]}
                      isGeneralRequest={true}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>{t('editJob.serviceAddress')}</Label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editForm.serviceAddress || ''} 
                        readOnly
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed text-gray-700"
                        placeholder={t('latestJobs.enterServiceAddress')}
                      />
                      <div className="group relative">
                        <Button
                          type="button"
                          variant="ghost"
                          className="p-3 hover:bg-teal-50 rounded-lg transition-all duration-200 hover:scale-105"
                          onClick={() => onNavigate('/register/client?step=2')}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-teal-500 group-hover:text-teal-600 transition-colors"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label className="flex items-center gap-2">
                      <span>📦</span>
                      {t('expectBring')}
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={editForm.expectBring || false}
                        disabled={true}
                        className="accent-teal-500 w-5 h-5 rounded border-teal-300 cursor-not-allowed opacity-60"
                      />
                      <span className="text-sm text-gray-600">
                        {t('expectBringDescription') || 'Provider should bring equipment and supplies'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">(Read-only)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => onEditSave(role)} 
                    disabled={editLoading} 
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {editLoading ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t('editJob.saveChanges')}
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={onEditCancel} 
                    variant="outline" 
                    className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    {t('editJob.cancel')}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-2">
                {showAcceptAction && !isEditing && (
                  <Button
                    onClick={() => onAcceptJob(job.id, role)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-full shadow-md px-4 py-2 font-semibold hover:from-teal-600 hover:to-teal-800 hover:scale-105 hover:text-white transition-all border-0"
                    disabled={processingAcceptId === job.id}
                  >
                    {processingAcceptId === job.id ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⟳</span> <span data-editable data-key="latestJobs.processing">{t('latestJobs.processing')}</span>
                      </span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" /> <span data-editable data-key="latestJobs.accept">{t('latestJobs.accept')}</span>
                      </>
                    )}
                  </Button>
                )}
                {canEditJob && !isEditing && (
                  <Button
                    onClick={() => onEditClick(job)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-full shadow-md px-4 py-2 font-semibold hover:from-teal-600 hover:to-teal-800 hover:scale-105 hover:text-white transition-all border-0"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> <span data-editable data-key="latestJobs.edit">{t('latestJobs.edit')}</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-teal-100 rounded-full px-2 py-1 shadow-sm">
                  <div className="relative">
                    <img
                      src={clientProfiles[job.clientId]?.profileImage ? `${API_BASE_URL}/${clientProfiles[job.clientId].profileImage}` : "/assets/img/client.jpg"}
                      alt={t('latestJobs.client') || 'Client'}
                      className="w-6 h-6 rounded-full object-cover border"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-teal-500 text-white text-[9px] px-1 rounded-full">C</span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 max-w-[8rem] truncate" title={`${clientProfiles[job.clientId]?.firstName || ''} ${clientProfiles[job.clientId]?.lastName || ''}`}>
                    {clientProfiles[job.clientId]?.firstName} {clientProfiles[job.clientId]?.lastName}
                  </span>
                </div>
                {job.providerId && (
                  <div 
                    className="flex items-center gap-1 bg-white border border-blue-100 rounded-full px-2 py-1 shadow-sm cursor-pointer hover:bg-blue-50"
                    onClick={() => onProviderClick(job.providerId)}
                  >
                    <div className="relative">
                      <img
                        src={providerProfiles[job.providerId]?.profileImage ? `${API_BASE_URL}/${providerProfiles[job.providerId].profileImage}` : "/assets/img/provider.jpg"}
                        alt={t('latestJobs.provider') || 'Provider'}
                        className="w-6 h-6 rounded-full object-cover border"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[9px] px-1 rounded-full">P</span>
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 max-w-[8rem] truncate" title={`${providerProfiles[job.providerId]?.firstName || ''} ${providerProfiles[job.providerId]?.lastName || ''}`}>
                      {providerProfiles[job.providerId]?.firstName} {providerProfiles[job.providerId]?.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-1 pt-2 border-t border-gray-100">
              <button
                onClick={() => onToggleTimeline(job.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white/20 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold"><span data-editable data-key="latestJobs.timeline">{t('latestJobs.timeline')}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-teal-100 font-medium">
                    {expandedTimelines[job.id] ? t('latestJobs.hide') : t('latestJobs.show')}
                  </span>
                  <div className="p-1 bg-white/20 rounded-full">
                    <svg
                      className={`w-4 h-4 text-white transition-transform duration-300 ${
                        expandedTimelines[job.id] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              {expandedTimelines[job.id] && (
                <div className="mt-3 px-4 py-3 bg-teal-50/80 rounded-2xl overflow-x-visible border-2 border-teal-100 shadow-inner">
                  <StatusTimeline steps={getStatusHistory(job, role)} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LatestJobsList;

