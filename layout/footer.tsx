"use client";
// UiFooter: Main footer with CTA, contact, and links
import React from "react";
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// EditableText import removed - using data-editable attributes instead

// Rename component
const UiFooter: React.FC = () => {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();

  // Handle CTA button click
  const handleCTAClick = () => {
    window.location.href = "/register/provider";
  };

  // Handle contact email click
  const handleEmailClick = () => {
    window.location.href = "mailto:vitago.swe@gmail.com";
  };

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mt-10">
      {/* CTA Section - Only show for non-logged-in users */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 py-12 px-6">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4 break-words">
              <span
                data-editable
                data-key="footer.cta.title"
                className="break-words cursor-pointer hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                {t('footer.cta.title')}
              </span>
            </h2>
            <div className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto break-words">
              <span
                data-editable
                data-key="footer.cta.description"
                className="break-words cursor-pointer hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                {t('footer.cta.description')}
              </span>
            </div>
            <div
              onClick={handleCTAClick}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-xl text-white bg-transparent hover:bg-white hover:text-teal-600 transition-all duration-300 transform hover:scale-105 break-words cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCTAClick()}
            >
              <span
                onClick={(e) => { e.stopPropagation(); }}
                data-editable
                data-key="footer.cta.button"
                className="break-words cursor-pointer hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                {t('footer.cta.button')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Section */}
      <div className="bg-white py-12 px-6 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 break-words">
              <span
                data-editable
                data-key="footer.contact.title"
                className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
              >
                {t('footer.contact.title')}
              </span>
            </h3>
            <div className="text-gray-600 text-lg break-words">
              <span
                data-editable
                data-key="footer.contact.description"
                className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
              >
                {t('footer.contact.description')}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {/* Email Contact */}
            <div className="flex items-center gap-3 text-gray-700 hover:text-teal-600 transition-colors duration-300">
              <Mail className="w-5 h-5 flex-shrink-0" />
              <a
                href="mailto:vitago.swe@gmail.com"
                onClick={handleEmailClick}
                className="text-lg font-medium hover:underline break-words"
              >
                vitago.swe@gmail.com
              </a>
            </div>

            {/* Phone Contact (if available) */}
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 flex-shrink-0" />
              <span className="text-lg break-words">
                <span
                  data-editable
                  data-key="footer.contact.phone"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('footer.contact.phone')}
                </span>
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="text-lg break-words">
                <span
                  data-editable
                  data-key="footer.contact.location"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('footer.contact.location')}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Section */}
      <div className="py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-xl font-bold text-gray-800 mb-4 break-words">
                <span
                  data-editable
                  data-key="footer.company.name"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('footer.company.name')}
                </span>
              </h4>
              <div className="text-gray-600 mb-4 max-w-md break-words">
                <span
                  data-editable
                  data-key="footer.company.description"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('footer.company.description')}
                </span>
              </div>
              <div className="flex space-x-4">
                {/* Social Media Links (placeholder) */}
                {/* <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors duration-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors duration-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a> */}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 break-words">
                <span
                  data-editable
                  data-key="footer.quickLinks.title"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('footer.quickLinks.title')}
                </span>
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="/about-us" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.quickLinks.about"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.quickLinks.about')}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/market-place" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.quickLinks.marketplace"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.quickLinks.marketplace')}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/FAQ" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.quickLinks.faq"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.quickLinks.faq')}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/register/provider" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.quickLinks.becomeProvider"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.quickLinks.becomeProvider')}
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 break-words">
                <span
                  data-editable
                  data-key="footer.support.title"
                  className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                >
                  {t('footer.support.title')}
                </span>
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="/general-requests" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.support.generalRequests"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.support.generalRequests')}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="/latest-jobs" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.support.latestJobs"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.support.latestJobs')}
                    </span>
                  </a>
                </li>
                <li>
                  <a href="mailto:vitago.swe@gmail.com" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 break-words">
                    <span
                      data-editable
                      data-key="footer.support.contact"
                      className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
                    >
                      {t('footer.support.contact')}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <div className="text-gray-500 text-sm break-words">
              &copy; {new Date().getFullYear()} Vitago. <span
                data-editable
                data-key="footer.copyright"
                className="break-words cursor-pointer px-2 py-1 rounded transition-colors"
              >
                {t('footer.copyright')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UiFooter;
