"use client";
// ConsentContent: Displays terms and conditions markdown based on language
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

// --- Helper: Get markdown file path by language (Next.js dynamic import) ---
async function getMarkdownContent(lang: string): Promise<string> {
  try {
    if (lang === 'sv') {
      const res = await fetch('/terms-conditions/Sv.md');
      return await res.text();
    }
    const res = await fetch('/terms-conditions/En.md');
    return await res.text();
  } catch {
    throw new Error('Failed to load terms.');
  }
}

// --- Main ConsentContent component ---
const ConsentContent: React.FC = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMarkdownContent(i18n.language)
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load terms.');
        setLoading(false);
      });
  }, [i18n.language]);

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading terms...</div>;
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
