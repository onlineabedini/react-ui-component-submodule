"use client";
import React, { useState, useEffect } from 'react';
import { useGlobalEditor } from '@/contexts/GlobalEditorContext';
import { Button } from '@/components/ui/button';
import { FiX, FiSave, FiRotateCcw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { getCookie } from '@/utils/authCookieService';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

const GlobalEditorModal: React.FC = () => {
  const { isOpen, currentText, currentOnSave, currentElementId, currentTranslationKey, closeEditor } = useGlobalEditor();
  const { t, i18n } = useTranslation();
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(currentText);
      setOriginalText(currentText);
      setError(null);
    }
  }, [isOpen, currentText]);

  const handleSave = async () => {
    if (!currentElementId) {
      setError('No element ID provided');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // First, call the original onSave callback if it exists
      if (currentOnSave) {
        currentOnSave(text);
      }

      // Update the DOM element
      const element = document.querySelector(`[data-key="${currentElementId}"]`) || 
                     document.getElementById(currentElementId);
      if (element) {
        element.textContent = text;
      }

      // Save to localStorage
      localStorage.setItem(`editable-${currentElementId}`, text);

      // Update translation file via API if this is a translation key
      if (currentTranslationKey && (currentTranslationKey.includes('.') || currentTranslationKey.includes('_'))) {
        await updateTranslation(currentTranslationKey, text);
      }

      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTranslation = async (key: string, value: string) => {
    try {
      const apiUrl = getApiUrl(API_ENDPOINTS.UPDATE_TRANSLATION);
      const requestBody = {
        language: i18n.language.split('-')[0], // Normalize locale codes like 'en-US' to 'en'
        key: key,
        value: value,
      };

      console.log('GlobalEditorModal: Saving translation to:', apiUrl);
      console.log('GlobalEditorModal: Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('token')}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Update i18n resource
        i18n.addResource(i18n.language, 'translation', key, value);
        console.log('GlobalEditorModal: Translation saved successfully');
      } else {
        const errorText = await response.text();
        console.error('GlobalEditorModal: Failed to save translation:', response.status, response.statusText);
        console.error('GlobalEditorModal: Error response:', errorText);
        throw new Error(`Failed to save translation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('GlobalEditorModal: Error saving translation:', error);
      throw error;
    }
  };

  const handleReset = () => {
    setText(originalText);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeEditor();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Text</h3>
          <Button variant="ghost" size="icon" onClick={closeEditor} className="hover:bg-gray-100">
            <FiX className="h-4 w-4" />
          </Button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="mb-3 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Element ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{currentElementId}</span>
            </label>
          </div>
          {currentTranslationKey && currentTranslationKey !== currentElementId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translation Key: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{currentTranslationKey}</span>
              </label>
            </div>
          )}
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          placeholder={t('common.enterTextHere')}
          autoFocus
        />
        
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={handleReset} className="hover:bg-gray-50">
            <FiRotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={closeEditor} className="hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white"
            >
              <FiSave className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Enter</kbd> to save, <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  );
};

export default GlobalEditorModal;
