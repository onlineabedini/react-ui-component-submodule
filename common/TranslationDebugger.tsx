"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

// Section: Debug component to test translation API endpoints
const TranslationDebugger: React.FC = () => {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section: Test debug endpoint
  const testDebugEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      const apiUrl = getApiUrl(API_ENDPOINTS.DEBUG_TRANSLATION);
      console.log('Testing debug endpoint:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'data',
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      console.log('Debug endpoint response:', result);
      setDebugResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Debug endpoint error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Section: Test update translation endpoint
  const testUpdateEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      const apiUrl = getApiUrl(API_ENDPOINTS.UPDATE_TRANSLATION);
      console.log('Testing update endpoint:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          language: 'en',
          key: 'test.key',
          value: 'Test value',
        }),
      });

      const result = await response.text();
      console.log('Update endpoint response:', response.status, result);
      
      try {
        const jsonResult = JSON.parse(result);
        setDebugResult({
          status: response.status,
          statusText: response.statusText,
          data: jsonResult,
        });
      } catch (e) {
        setDebugResult({
          status: response.status,
          statusText: response.statusText,
          rawData: result,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Update endpoint error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold">Translation API Debugger</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={testDebugEndpoint} 
          disabled={isLoading}
          variant="outline"
        >
          Test Debug Endpoint
        </Button>
        
        <Button 
          onClick={testUpdateEndpoint} 
          disabled={isLoading}
          variant="outline"
        >
          Test Update Endpoint
        </Button>
      </div>

      {isLoading && (
        <div className="text-blue-600">Testing endpoint...</div>
      )}

      {error && (
        <div className="text-red-600 p-3 bg-red-50 border border-red-200 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {debugResult && (
        <div className="space-y-2">
          <h3 className="font-semibold">Result:</h3>
          <pre className="bg-white p-3 border rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p><strong>Debug Endpoint:</strong> {getApiUrl(API_ENDPOINTS.DEBUG_TRANSLATION)}</p>
        <p><strong>Update Endpoint:</strong> {getApiUrl(API_ENDPOINTS.UPDATE_TRANSLATION)}</p>
        <p><strong>Current Environment:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'Server'}</p>
      </div>
    </div>
  );
};

export default TranslationDebugger;
