
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { fetchTranslations, fetchModules, fetchSections } from '@/lib/api';
import TranslationTable from '@/components/TranslationTable';

const ShiftAllowanceTranslations = () => {
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    Promise.all([
      loadTranslations(),
      loadModules(),
      loadSections()
    ]);
  }, []);

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

  const loadModules = async () => {
    try {
      const data = await fetchModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
    }
  };

  const loadSections = async () => {
    try {
      const data = await fetchSections();
      setSections(data);
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Shift Allowance Translations</h1>
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
          modules={modules}
          sections={sections}
        />
      )}
    </div>
  );
};

export default ShiftAllowanceTranslations;
