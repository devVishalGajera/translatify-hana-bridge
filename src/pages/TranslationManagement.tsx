
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Translation, 
  fetchTranslations, 
  addTranslation, 
  fetchModules, 
  fetchSections,
  Module,
  Section
} from '@/lib/api';
import TranslationTable from '@/components/TranslationTable';
import TranslationUpload from '@/components/TranslationUpload';
import TranslationForm from '@/components/TranslationForm';

const TranslationManagement = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    Promise.all([
      loadTranslations(),
      loadModules(),
      loadSections()
    ]);
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [selectedModule]);

  const loadTranslations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTranslations(selectedModule === 'all' ? undefined : selectedModule);
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

  const handleModuleChange = (value: string) => {
    setSelectedModule(value);
    // Reset section when module changes
    setSelectedSection('all');
  };

  const handleAddTranslation = async (translation: Partial<Translation>) => {
    try {
      await addTranslation(translation);
      loadTranslations();
    } catch (error) {
      console.error('Failed to add translation:', error);
      throw error;
    }
  };

  const filteredTranslations = translations.filter(translation => {
    // Filter by module
    if (selectedModule !== 'all' && translation.module !== selectedModule) {
      return false;
    }
    
    // Filter by section (assuming translation_key corresponds to section)
    if (selectedSection !== 'all' && translation.translation_key !== selectedSection) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        translation.translation_key.toLowerCase().includes(searchLower) ||
        translation.en.toLowerCase().includes(searchLower) ||
        translation.de.toLowerCase().includes(searchLower) ||
        translation.fr.toLowerCase().includes(searchLower) ||
        translation.es.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Translation Management</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsFormOpen(true)}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Translation
          </Button>
          <TranslationUpload onUploadComplete={loadTranslations} />
          <Button 
            variant="outline" 
            onClick={loadTranslations}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Module</label>
            <Select
              value={selectedModule}
              onValueChange={handleModuleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Section</label>
            <Select
              value={selectedSection}
              onValueChange={setSelectedSection}
              disabled={selectedModule === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections
                  .filter(section => selectedModule === 'all' || section.module === selectedModule)
                  .map(section => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search translations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredTranslations.length} of {translations.length} translations
        </div>
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
          translations={filteredTranslations} 
          module={selectedModule !== 'all' ? selectedModule : undefined}
          onUpdate={loadTranslations}
          modules={modules}
          sections={sections}
        />
      )}

      <TranslationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddTranslation}
        modules={modules}
        sections={sections}
      />
    </div>
  );
};

export default TranslationManagement;
