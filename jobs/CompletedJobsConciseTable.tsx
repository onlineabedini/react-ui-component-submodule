"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/api';
import ServiceTypeDisplay from '@/components/common/ServiceTypeDisplay';
import StarRating from '@/components/common/StarRating';
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

type CompletedJobsConciseTableProps = {
  jobsList: Job[];
  emptyMsg: string;
  role: 'client' | 'provider';
  clientProfiles: Record<string, any>;
  providerProfiles: Record<string, any>;
  reports: Record<string, Report[]>;
  getCombinedStatus: (job: Job) => string;
  getStatusColor: (status: string) => string;
  onOpenJobDetails: (job: Job, role: 'client' | 'provider') => void;
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

const CompletedJobsConciseTable: React.FC<CompletedJobsConciseTableProps> = ({
  jobsList,
  emptyMsg,
  role,
  clientProfiles,
  providerProfiles,
  reports,
  getCombinedStatus,
  getStatusColor,
  onOpenJobDetails,
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

  if (jobsList.length === 0) {
    return (
      <div className="text-gray-600 text-sm py-4">{emptyMsg}</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.service')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.date')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.participants')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('jobs.rating')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.status')}</th>
              <th className="text-right px-4 py-3 font-semibold">{t('latestJobs.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {jobsList.map((job) => {
              const serviceLabels = getServiceTypes(job.typeOfService).map(type => t(`latestJobs.tags.${normalizeServiceTypeKey(type)}`) || type);
              const client = clientProfiles[job.clientId];
              const provider = job.providerId ? providerProfiles[job.providerId] : null;
              const providerReport = hasProviderReport(job.id);
              const rating = providerReport?.rate || 0;
              
              return (
                <tr
                  key={job.id}
                  className="group border-t hover:bg-green-50/60 transition-colors cursor-pointer"
                  onClick={() => onOpenJobDetails(job, role)}
                >
                  <td className="px-4 py-3 align-middle">
                    <ServiceTypeDisplay services={serviceLabels} variant="compact" />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="text-xs text-gray-700">
                      {(() => {
                        const chips = getFormattedDateChips(job.bookingDate);
                        if (chips.length > 0) {
                          return chips[0]; // Show first date chip
                        }
                        return formatDateTime(getSafeDate(job.bookingDate));
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      {/* Client */}
                      <div className="flex items-center gap-2">
                        <img
                          src={client?.profileImage ? `${API_BASE_URL}/${client.profileImage}` : "/assets/img/client.jpg"}
                          alt="client"
                          className="w-7 h-7 rounded-full object-cover border"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-700 max-w-[8rem] truncate">
                            {(client?.firstName || '') + ' ' + (client?.lastName || '')}
                          </span>
                          <span className="text-[10px] text-gray-500">{t('latestJobs.labels.client')}</span>
                        </div>
                      </div>
                      
                      {/* Provider (if assigned) */}
                      {provider ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={provider.profileImage ? `${API_BASE_URL}/${provider.profileImage}` : "/assets/img/provider.jpg"}
                            alt="provider"
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700 max-w-[8rem] truncate">
                              {(provider.firstName || '') + ' ' + (provider.lastName || '')}
                            </span>
                            <span className="text-[10px] text-gray-500">{t('latestJobs.labels.provider')}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <StarRating rating={rating} starClassName="w-4 h-4" />
                      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <svg className="w-3 h-3 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('latestJobs.completed')}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                      onClick={(e) => { e.stopPropagation(); onOpenJobDetails(job, role); }}
                    >
                      {t('latestJobs.view')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompletedJobsConciseTable;

