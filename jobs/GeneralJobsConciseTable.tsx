"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/config/api';
import ServiceTypeDisplay from '@/components/common/ServiceTypeDisplay';
import { useAppNavigation } from '@/utils/routing-migration';

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

type GeneralJobsConciseTableProps = {
  jobsList: Job[];
  emptyMsg: string;
  role: 'client' | 'provider';
  clientProfiles: Record<string, any>;
  providerProfiles: Record<string, any>;
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

const GeneralJobsConciseTable: React.FC<GeneralJobsConciseTableProps> = ({
  jobsList,
  emptyMsg,
  role,
  clientProfiles,
  providerProfiles,
  onOpenJobDetails,
  onFetchUserProfiles,
}) => {
  const { t } = useTranslation();
  const { navigate } = useAppNavigation();

  if (jobsList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMsg}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.service')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.labels.client')}</th>
              <th className="text-left px-4 py-3 font-semibold">{t('latestJobs.labels.provider')}</th>
              <th className="text-right px-4 py-3 font-semibold">{t('latestJobs.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {jobsList.map((job) => {
              const serviceLabels = getServiceTypes(job.typeOfService).map(type => t(`latestJobs.tags.${normalizeServiceTypeKey(type)}`) || type);
              const client = clientProfiles[job.clientId];
              const provider = job.providerId ? providerProfiles[job.providerId] : null;
              
              // Fetch profiles if not loaded
              if (!client || (job.providerId && !provider)) {
                onFetchUserProfiles(job);
              }
              
              return (
                <tr
                  key={job.id}
                  className="group border-t hover:bg-teal-50/60 transition-colors cursor-pointer"
                  onClick={() => onOpenJobDetails(job, role)}
                >
                  <td className="px-4 py-3 align-middle">
                    <ServiceTypeDisplay services={serviceLabels} variant="compact" />
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
                          <span className="text-xs text-gray-500">
                            {t('latestJobs.noProvider')}
                          </span>
                          <span className="text-[10px] text-gray-400">{t('latestJobs.statuses.pending')}</span>
                        </div>
                      </div>
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

export default GeneralJobsConciseTable;

