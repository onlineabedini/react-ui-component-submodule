"use client";
// Navbar: Main navigation bar with user and language controls
import React from "react";
import ChangeLang from "@/components/global/changeLangDropdown";
import { FiLogOut, FiUser, FiBriefcase, FiInfo, FiHeart, FiHelpCircle, FiTrendingUp, FiMessageSquare, FiDollarSign } from "react-icons/fi";
import { getCookie, removeCookie } from '@/utils/authCookieService';
import { useTranslation } from 'react-i18next';
import { useRouter } from "next/navigation";

// Navbar component with comprehensive navigation
const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  // Check if user is logged in based on cookies
  const isLoggedIn = (getCookie('clientId') || getCookie('providerId')) && getCookie('token');
  const isProvider = !!getCookie('providerId');
  const isClient = !!getCookie('clientId');
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

  // Handle logout
  const handleLogout = () => {
    // Clear all user data and cookies
    // check if they exist
    if (getCookie('clientId')) {
      removeCookie('clientId');
    }
    if (getCookie('providerId')) {
      removeCookie('providerId');
    }
    if (getCookie('token')) {
      removeCookie('token');
    }
    // if super admin, remove all cookies
    if (getCookie('isSuperAdmin')) {
      removeCookie('isSuperAdmin');
    }

    // remove userRole from localStorage
    if (localStorage.getItem('userRole')) {
      localStorage.removeItem('userRole');
    }

    // Redirect to home page - refresh the page
    router.push('/');
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
                    {/* User Type Header */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-teal-600">
                          {isProvider ? 'Provider' : 'Client'}
                        </span>
                        <span className="text-xs text-gray-500">Click to edit</span>
                      </div>
                    </div>

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

                    {/* Favorites - Only for clients */}
                    {isClient && (
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
                    )}

                    {/* Edit Profile - Only for providers */}
                    {isProvider && (
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
                    )}

                    {/* Monthly Balance - Only for providers */}
                    {isProvider && (
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
                    )}

                    {/* General Requests - Only for clients */}
                    {isClient && (
                      <a
                        href="/register/client?step=2"
                        className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 break-words"
                      >
                        <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span
                          data-editable
                          data-key="navbar.requests"
                          className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                        >
                          {t('navbar.requests')}
                        </span>
                      </a>
                    )}

                    {/* Edit Profile - Only for clients */}
                    {isClient && (
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
    </div>
  );
};

export default Navbar;