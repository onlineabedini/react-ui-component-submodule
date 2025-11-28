"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/api';
import ServiceTypeDisplay from '@/components/common/ServiceTypeDisplay';
import { formatDateYYYYMMDD, formatDateEuropean } from '@/lib/utils';
import { Report } from '@/types/report';
import { useAppNavigation } from '@/utils/routing-migration';
import { getTranslatedServiceType } from '@/utils/serviceTypeTranslation';

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

type PendingJobsConciseTableProps = {
  jobsList: Job[];
  emptyMsg: string;
  role: 'client' | 'provider';
  clientProfiles: Record<string, any>;
  providerProfiles: Record<string, any>;
  volunteersByBooking: Record<string, string[]>;
  reports: Record<string, Report[]>;
  getCombinedStatus: (job: Job, volunteersByBookingParam?: Record<string, string[]>) => string;
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

const PendingJobsConciseTable: React.FC<PendingJobsConciseTableProps> = ({
  jobsList,
  emptyMsg,
  role,
  clientProfiles,
  providerProfiles,
  volunteersByBooking,
  reports,
  getCombinedStatus,
  getStatusColor,
  onOpenJobDetails,
}) => {
  const { t } = useTranslation();
  const { navigate } = useAppNavigation();

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
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.labels.client')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.labels.provider')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.status')}</th>
              <th className="text-right px-4 py-3 font-semibold">{t('latestJobs.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {jobsList.map((job) => {
              const serviceLabels = getServiceTypes(job.typeOfService).map(type => getTranslatedServiceType(type, t));
              const client = clientProfiles[job.clientId];
              const provider = job.providerId ? providerProfiles[job.providerId] : null;
              const providerReport = hasProviderReport(job.id);
              const clientAcceptedReport = hasClientAcceptedReport(job.id);
              
              return (
                <tr
                  key={job.id}
                  className="group border-t hover:bg-blue-50/60 transition-colors cursor-pointer"
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
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {provider ? (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-teal-50 rounded-lg p-1 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/provider/${job.providerId}`);
                        }}
                      >
                        <img
                          src={provider.profileImage ? `${API_BASE_URL}/${provider.profileImage}` : "/assets/img/provider.jpg"}
                          alt="provider"
                          className="w-7 h-7 rounded-full object-cover border"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-700 max-w-[8rem] truncate hover:text-teal-600 transition-colors">
                            {(provider.firstName || '') + ' ' + (provider.lastName || '')}
                          </span>
                          <span className="text-[10px] text-gray-500">{t('latestJobs.labels.provider')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 border flex items-center justify-center">
                          <span className="text-xs text-gray-500">?</span>
                        </div>
                        <div className="flex flex-col">
                          {(volunteersByBooking[job.id] || job.volunteerProviders || []).length > 0 ? (
                            <span className="text-xs text-teal-600 font-medium">
                              {(volunteersByBooking[job.id] || job.volunteerProviders || []).length} {t('latestJobs.volunteers')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {t('latestJobs.noProvider')}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400">{t('latestJobs.statuses.pending')}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {providerReport && !clientAcceptedReport ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {t('latestJobs.statusValues.waitingForRating')}
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(getCombinedStatus(job, volunteersByBooking))}`}>
                        {getCombinedStatus(job, volunteersByBooking)}
                      </span>
                    )}
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

export default PendingJobsConciseTable;

