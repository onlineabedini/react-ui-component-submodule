"use client";
// Navbar: Main navigation bar with user and language controls
import React, { useState, useEffect } from "react";
import ChangeLang from "@/components/global/changeLangDropdown";
import { FiLogOut, FiUser, FiBriefcase, FiInfo, FiHeart, FiHelpCircle, FiTrendingUp, FiMessageSquare, FiDollarSign } from "react-icons/fi";
import { getCookie, removeCookie } from '@/utils/authCookieService';
import { useTranslation } from 'react-i18next';
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import BookingSheet from '@/app/marketPlace/components/BookingSheet';
import { toast } from 'sonner';
import { clientService } from '@/services/client.service';
import { providerService } from '@/services/provider.service';
import { API_BASE_URL } from '@/config/api';
import { getProfileImage, getDefaultClientImage, getDefaultProviderImage } from '@/utils/imageUtils';

// Navbar component with comprehensive navigation
const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // Auth state (reactive via polling in useAuth)
  const { isLoggedIn, isProvider, isClient, handleLogout } = useAuth();
  // State for general request modal
  const [isGeneralRequestOpen, setIsGeneralRequestOpen] = useState(false);
  // State for user data
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data when logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (isClient) {
        const clientId = getCookie('clientId');
        if (clientId) {
          try {
            const data = await clientService.getClient(clientId);
            setUserData(data);
          } catch (error) {
            console.error('Failed to fetch client data:', error);
          }
        }
      } else if (isProvider) {
        const providerId = getCookie('providerId');
        if (providerId) {
          try {
            const data = await providerService.getProfile(providerId);
            setUserData(data);
          } catch (error) {
            console.error('Failed to fetch provider data:', error);
          }
        }
      }
    };

    fetchUserData();
  }, [isClient, isProvider]);
  const items = [
    {
      label: t('navbar.marketplace'),
      href: '/marketPlace',
      icon: FiBriefcase,
    },
    {
      label: t('navbar.faq'),
      href: '/FAQ',
      icon: FiHelpCircle,
    },
    {
      label: t('navbar.services'),
      href: '/services',
      icon: FiBriefcase,
    },
    {
      label: t('navbar.aboutUs'),
      href: '/about-us',
      icon: FiInfo,
    },
  ];

  // Keep a callback to trigger logout using hook, plus hard refresh to fully reset UI if desired
  const onLogoutClick = () => {
    handleLogout();
    // Optional: force refresh for components not using the hook yet
    window.location.reload();
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-6 mx-auto border border-gray-100/50 mb-8 max-w-7xl transition-all duration-300 hover:shadow-teal-100/20">
      <nav className="flex justify-between items-center mx-auto">
        {/* Logo with hover effect */}
        <a href="/" className="group flex items-center transform hover:scale-[1.02] transition-all duration-300">
          <span className="text-3xl font-extrabold transition-all duration-300">
            <span className="text-teal-600 group-hover:text-teal-700 break-words">
              <span
                data-editable
                data-key="navbar.brand"
                className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
              >
                {t('navbar.brand')}
              </span>
            </span>
          </span>
          <div className="relative ml-2">
            <div className="absolute inset-0 bg-teal-400 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative h-2 w-2 bg-teal-500 rounded-full group-hover:animate-ping"></div>
          </div>
        </a>

        {/* Navigation Links and Buttons */}
        <div className="flex items-center space-x-8">
          <div>
            <ChangeLang />
          </div>

          {/* Main Navigation Links */}
          <div className="flex space-x-8 text-lg font-medium">
            {items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-gray-600 hover:text-teal-600 transition-colors duration-300
                         after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-teal-600 
                         after:transition-all after:duration-300 hover:after:w-full flex items-center gap-2 break-words"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span
                  data-editable
                  data-key={`navbar.${item.label}`}
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t(`${item.label}`)}
                </span>
              </a>
            ))}
          </div>

          {/* User Actions Section */}
          <div className="flex space-x-4 border-l border-gray-200 pl-8">
            {isLoggedIn ? (
              // Logged in user - show My Account dropdown
              <div className="relative group">
                <button className="relative bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-300
                                 shadow-lg hover:shadow-teal-200 transform hover:-translate-y-0.5 flex items-center gap-2 break-words">
                  <FiUser className="w-5 h-5 flex-shrink-0" />
                  <span
                    data-editable
                    data-key="navbar.myAccount"
                    className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                  >
                    {t('navbar.myAccount') || 'My Account'}
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg opacity-0 invisible
                              group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100">
                  <div className="p-4 space-y-3">
                    {/* User Type Header with Profile Image */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100">
                      {/* Profile Image - Only for clients */}
                      {isClient && userData && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-200 flex-shrink-0">
                          <img
                            src={getProfileImage(userData.profileImage, API_BASE_URL, getDefaultClientImage())}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getDefaultClientImage();
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Provider Profile Image */}
                      {isProvider && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-200 flex-shrink-0">
                          {userData && userData.profileImage ? (
                            <img
                              src={getProfileImage(userData.profileImage, API_BASE_URL, getDefaultProviderImage())}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = getDefaultProviderImage();
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
                              {userData ? (userData.firstName?.[0] || userData.username?.[0] || 'P') : 'P'}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-teal-600">
                          {isProvider ? 'Provider' : 'Client'}
                        </span>
                        {userData && (
                          <span className="text-sm text-gray-600">
                            {userData.firstName} {userData.lastName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CLIENT MENU ITEMS */}
                    {isClient && (
                      <>
                        {/* Marketplace - Primary action */}
                        <a
                          href="/marketPlace"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiBriefcase className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.marketplace"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.marketplace')}
                          </span>
                        </a>

                        {/* Create General Request - Quick action */}
                        <button
                          onClick={() => setIsGeneralRequestOpen(true)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="createGeneralRequest"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('createGeneralRequest')}
                          </span>
                        </button>

                        {/* Latest Jobs */}
                        <a
                          href="/latest-jobs"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.latestJobs"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.latestJobs')}
                          </span>
                        </a>

                        {/* Favorites */}
                        <a
                          href={`/favorites/${getCookie('clientId')}`}
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiHeart className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.favorites"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.favorites')}
                          </span>
                        </a>

                        {/* Edit Profile */}
                        <a
                          href="/register/client?step=2"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiUser className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.editProfile"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.editProfile')}
                          </span>
                        </a>
                      </>
                    )}

                    {/* PROVIDER MENU ITEMS */}
                    {isProvider && (
                      <>
                        {/* Latest Jobs */}
                        <a
                          href="/latest-jobs"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.latestJobs"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.latestJobs')}
                          </span>
                        </a>

                        {/* General Jobs */}
                        <a
                          href="/general-requests"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiBriefcase className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.generalJobs"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.generalJobs')}
                          </span>
                        </a>

                        {/* Monthly Balance */}
                        <a
                          href="/monthly-balance"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiDollarSign className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.balance"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.balance')}
                          </span>
                        </a>

                        {/* Edit Profile */}
                        <a
                          href="/register/provider?step=2"
                          className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                        >
                          <FiUser className="w-4 h-4 flex-shrink-0" />
                          <span
                            data-editable
                            data-key="navbar.editProfile"
                            className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                          >
                            {t('navbar.editProfile')}
                          </span>
                        </a>
                      </>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-left"
                    >
                      <FiLogOut className="w-4 h-4 flex-shrink-0" />
                      <span
                        data-editable
                        data-key="navbar.logout"
                        className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                      >
                        {t('navbar.logout')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Not logged in - Show Try Services button
              <a
                href="/landing"
                className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-500 text-white py-2.5 px-6 rounded-lg 
                         hover:from-teal-500 hover:to-teal-400 transition-all duration-300 shadow-lg
                         hover:shadow-teal-200 transform hover:-translate-y-0.5 flex items-center gap-2 group/btn
                         before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500 break-words"
              >
                <FiBriefcase className="text-white flex-shrink-0" />
                <span
                  data-editable
                  data-key="navTryServices"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('navTryServices')}
                </span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* General Request Modal */}
      <BookingSheet
        open={isGeneralRequestOpen}
        onOpenChange={setIsGeneralRequestOpen}
        isGeneralRequest={true}
        onSuccess={() => {
          setIsGeneralRequestOpen(false);
          toast.success(t('requestSuccess', 'General request sent successfully!'));
        }}
      />
    </div>
  );
};

export default Navbar;