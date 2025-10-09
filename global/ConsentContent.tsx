"use client";
// ConsentContent: Displays terms and conditions markdown based on language
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

interface ConsentContentProps {
  // Base path under /assets to load markdown files from
  // e.g. "/provider-terms-conditions" or "/client-terms-conditions"
  basePath?: string;
}

// --- Helper: Get markdown file path by language from public assets ---
async function getMarkdownContent(lang: string, basePath: string): Promise<string> {
  const sanitizedBase = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const fileName = lang === 'sv' ? 'Sv.md' : 'En.md';
  const url = `/assets${sanitizedBase}/${fileName}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return await res.text();
  } catch {
    throw new Error('Failed to load terms.');
  }
}

// --- Main ConsentContent component ---
const ConsentContent: React.FC<ConsentContentProps> = ({ basePath = "/provider-terms-conditions" }) => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMarkdownContent(i18n.language, basePath)
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(t('common.failedToLoadTerms'));
        setLoading(false);
      });
  }, [i18n.language, basePath]);

  if (loading) {
    return <div className="text-gray-500 text-sm">{t('common.loadingTerms')}</div>;
  }
  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default ConsentContent;
