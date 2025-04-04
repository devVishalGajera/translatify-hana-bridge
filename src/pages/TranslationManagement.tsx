
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, RefreshCw, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Translation } from '@/lib/api';
import TranslationTable from '@/components/TranslationTable';
import TranslationUpload from '@/components/TranslationUpload';

const TranslationManagement = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Sections grouped by module for filter dropdown
  const moduleSections = {
    offboarding: ['exit_interview', 'equipment_return', 'final_paycheck'],
    shift_allowance: ['night_shift', 'weekend_allowance', 'holiday_pay']
  };

  // Mock data for dropdown options
  const modules = [
    { id: 'offboarding', name: 'Offboarding' },
    { id: 'shift_allowance', name: 'Shift Allowance' }
  ];

  const sections = [
    { id: 'exit_interview', name: 'Exit Interview', module: 'offboarding' },
    { id: 'equipment_return', name: 'Equipment Return', module: 'offboarding' },
    { id: 'final_paycheck', name: 'Final Paycheck', module: 'offboarding' },
    { id: 'night_shift', name: 'Night Shift', module: 'shift_allowance' },
    { id: 'weekend_allowance', name: 'Weekend Allowance', module: 'shift_allowance' },
    { id: 'holiday_pay', name: 'Holiday Pay', module: 'shift_allowance' }
  ];

  useEffect(() => {
    loadTranslations();
  }, [selectedModule]);

  const loadTranslations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call - in real app this would fetch from backend
      // We'll use the data from our API module but add section info
      const mockData: Translation[] = [];
      
      if (selectedModule === 'all' || selectedModule === 'offboarding') {
        mockData.push(
          {
            module: 'offboarding',
            translation_key: 'exit_interview',
            en: 'Exit Interview',
            de: 'Austrittsgespräch',
            fr: 'Entretien de départ',
            es: 'Entrevista de salida'
          },
          {
            module: 'offboarding',
            translation_key: 'return_equipment',
            en: 'Return Equipment',
            de: 'Geräterückgabe',
            fr: 'Retour de l\'équipement',
            es: 'Devolución de equipo'
          },
          {
            module: 'offboarding',
            translation_key: 'final_paycheck',
            en: 'Final Paycheck',
            de: 'Letzte Gehaltsabrechnung',
            fr: 'Dernier salaire',
            es: 'Cheque final'
          }
        );
      }
      
      if (selectedModule === 'all' || selectedModule === 'shift_allowance') {
        mockData.push(
          {
            module: 'shift_allowance',
            translation_key: 'night_shift',
            en: 'Night Shift',
            de: 'Nachtschicht',
            fr: 'Quart de nuit',
            es: 'Turno nocturno'
          },
          {
            module: 'shift_allowance',
            translation_key: 'weekend_allowance',
            en: 'Weekend Allowance',
            de: 'Wochenendzulage',
            fr: 'Allocation de week-end',
            es: 'Subsidio de fin de semana'
          },
          {
            module: 'shift_allowance',
            translation_key: 'holiday_pay',
            en: 'Holiday Pay',
            de: 'Feiertagszuschlag',
            fr: 'Prime de jour férié',
            es: 'Pago por días festivos'
          }
        );
      }
      
      setTranslations(mockData);
    } catch (err) {
      setError('Failed to load translations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (value: string) => {
    setSelectedModule(value);
    // Reset section when module changes
    setSelectedSection('all');
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
        />
      )}
    </div>
  );
};

export default TranslationManagement;
