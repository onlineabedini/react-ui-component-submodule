"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Check, Eye, ArrowRight, X } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import ServiceTypeDisplay from '@/components/common/ServiceTypeDisplay';
import { formatDateYYYYMMDD, formatDateEuropean } from '@/lib/utils';

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
  clientAccept: boolean;
  providerAccept: boolean;
  volunteerProviders?: string[];
};

type GeneralJobsListProps = {
  jobsList: Job[];
  emptyMsg: string;
  role: 'client' | 'provider';
  clientProfiles: Record<string, any>;
  providerProfiles: Record<string, any>;
  processingAcceptId: string | null;
  acceptedJobId: string | null;
  showSuccessMessage: boolean;
  isProviderVolunteer: (job: Job) => boolean;
  onAcceptJob: (jobId: string) => void;
  onSummaryModalOpen: (job: Job) => void;
  onNavigate: (path: string) => void;
  onOpenJobDetails: (job: Job, role: 'client' | 'provider') => void;
  onFetchUserProfiles: (job: Job) => void;
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

const GeneralJobsList: React.FC<GeneralJobsListProps> = ({
  jobsList,
  emptyMsg,
  role,
  clientProfiles,
  providerProfiles,
  processingAcceptId,
  acceptedJobId,
  showSuccessMessage,
  isProviderVolunteer,
  onAcceptJob,
  onSummaryModalOpen,
  onNavigate,
  onOpenJobDetails,
  onFetchUserProfiles,
}) => {
  const { t } = useTranslation();

  if (jobsList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMsg}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobsList.map((job) => {
        // Fetch profiles if not loaded
        const client = clientProfiles[job.clientId];
        const provider = job.providerId ? providerProfiles[job.providerId] : null;
        
        if (!client || (job.providerId && !provider)) {
          onFetchUserProfiles(job);
        }

        return (
          <div
            key={job.id}
            className="relative p-5 border rounded-2xl bg-white/95 shadow-lg transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] flex flex-col gap-2 before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-full border-gray-100 before:from-teal-400 before:to-teal-600 hover:bg-gradient-to-br hover:from-teal-50 hover:to-white"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="flex items-center justify-between mb-2">
              <ServiceTypeDisplay services={getServiceTypes(job.typeOfService).map(type => t(`latestJobs.tags.${normalizeServiceTypeKey(type)}`) || type)} variant="compact" className="font-semibold text-lg" />
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                  {t('latestJobs.statusValues.' + (job.status ? job.status.toLowerCase() : 'pending'))}
                </span>
                <button
                  className="ml-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold hover:bg-teal-200 transition flex items-center gap-1"
                  onClick={() => onSummaryModalOpen(job)}
                >
                  <Eye className="w-4 h-4 mr-1" /> {t('latestJobs.viewSummary')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
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
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-teal-500" />
                  <span>{job.proposedStartTime} - {job.proposedEndTime}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  <div className="flex items-center gap-2">
                    <span>{job.serviceAddress}</span>
                  </div>
                  <CopyButton text={job.serviceAddress} />
                </div>
                
                {job.expectBring && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📦</span>
                    <span className="font-medium mr-2">{t('expectBring')}:</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                      {t('expectBringDescription') || 'Provider should bring equipment and supplies'}
                    </span>
                  </div>
                )}

                {Array.isArray(job.volunteerProviders) && job.volunteerProviders.length > 0 && (
                  <div className="flex items-center text-sm text-teal-700">
                    <span className="mr-2">🤝</span>
                    <span className="font-medium mr-1">{t('generalRequests.volunteers')}:</span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs rounded-full border border-teal-200">
                      {job.volunteerProviders.length}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-lg font-bold text-teal-700">{t('generalRequests.currency', { value: job.totalPrice })}</span>
                </div>
                <div className="flex flex-col items-end mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="italic">{t('generalRequests.acceptingJobWillMoveVolunteers')}</span>
                  </div>
                  {showSuccessMessage && acceptedJobId === job.id && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <Check className="w-4 h-4" />
                      <span>{t('generalRequests.addedToVolunteers')}</span>
                      <button
                        onClick={() => onNavigate('/jobs')}
                        className="flex items-center gap-1 text-green-700 hover:text-green-800 font-medium"
                      >
                        {t('generalRequests.viewNow')}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!showSuccessMessage && acceptedJobId !== job.id && isProviderVolunteer(job) && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      <Check className="w-4 h-4" />
                      <span>{t('generalRequests.alreadyVolunteer') || 'You volunteered for this job'}</span>
                    </div>
                  )}
                  {!showSuccessMessage && acceptedJobId !== job.id && !isProviderVolunteer(job) && (
                    <button
                      onClick={() => onAcceptJob(job.id)}
                      disabled={processingAcceptId === job.id}
                      className="flex items-center gap-1 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-full shadow-md px-4 py-2 font-semibold hover:from-teal-600 hover:to-teal-800 hover:scale-105 hover:text-white transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingAcceptId === job.id ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⟳</span> {t('generalRequests.processing')}
                        </span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" /> {t('generalRequests.volunteerForJob')}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GeneralJobsList;

