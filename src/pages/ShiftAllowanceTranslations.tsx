
import React, { useState, useEffect } from 'react';
import { fetchTranslations, Translation } from '@/lib/api';
import TranslationTable from '@/components/TranslationTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShiftAllowanceTranslations = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTranslations('shift_allowance');
      setTranslations(data);
    } catch (err) {
      setError('Failed to load translations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Shift Allowance Module Translations</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={loadTranslations}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      ) : (
        <TranslationTable 
          translations={translations} 
          module="shift_allowance"
          onUpdate={loadTranslations}
        />
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h2 className="text-lg font-medium mb-2">Backend Integration Notes</h2>
        <p className="text-sm text-gray-600">
          This component is currently using mock data. To connect to your actual Node.js backend:
        </p>
        <ol className="list-decimal list-inside mt-2 text-sm text-gray-600 space-y-1">
          <li>Set up your Node.js backend with SAP HANA integration</li>
          <li>Update the API_BASE_URL in src/lib/api.ts to point to your backend</li>
          <li>Ensure your backend implements the required endpoints for fetching and updating translations</li>
        </ol>
      </div>
    </div>
  );
};

export default ShiftAllowanceTranslations;
