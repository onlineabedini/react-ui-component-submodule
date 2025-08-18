"use client";

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18nReady } from '@/lib/i18n';

// Props for the I18nProvider component
interface I18nProviderProps {
  children: React.ReactNode;
}

// Component that waits for i18n initialization with custom loading screen
const I18nWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [i18n, setI18n] = useState<any>(null);
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    // Force ready after 1 second to bypass i18n issues
    const forceReady = setTimeout(() => {
      console.log('Forcing i18n ready to bypass loading issues');
      setIsI18nReady(true);
    }, 1000);

    // Try normal i18n initialization
    i18nReady.then((i18nInstance) => {
      clearTimeout(forceReady);
      setI18n(i18nInstance);
      setIsI18nReady(true);
    }).catch((error) => {
      clearTimeout(forceReady);
      console.error('Failed to initialize i18n:', error);
      setIsI18nReady(true);
    });

    return () => clearTimeout(forceReady);
  }, []);

  if (!isI18nReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e2e8f0',
            borderTop: '2px solid #0d9488',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading Vitago...
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // If i18n is available, use it; otherwise render without i18n
  return i18n ? (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  ) : (
    <>{children}</>
  );
};

// Client-side i18n provider component
export default function I18nProvider({ children }: I18nProviderProps) {
  return <I18nWrapper>{children}</I18nWrapper>;
} 