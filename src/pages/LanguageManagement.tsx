
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { RefreshCw, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import LanguageForm from '@/components/LanguageForm';
import { fetchLanguages, deleteLanguage, toggleLanguageStatus, setDefaultLanguage } from '@/lib/api';

export interface Language {
  id: string;
  code: string;
  name: string;
  active: boolean;
  is_default: boolean;
}

const LanguageManagement = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    setLoading(true);
    try {
      const data = await fetchLanguages();
      setLanguages(data);
    } catch (error) {
      console.error('Failed to load languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditForm = (language: Language) => {
    setCurrentLanguage(language);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (language: Language) => {
    setLanguageToDelete(language);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!languageToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteLanguage(languageToDelete.id);
      toast.success(`Language "${languageToDelete.name}" deleted successfully`);
      loadLanguages();
    } catch (error) {
      console.error('Failed to delete language:', error);
      toast.error('Failed to delete language');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLanguageToDelete(null);
    }
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      await toggleLanguageStatus(id, active);
      setLanguages(languages.map(lang => 
        lang.id === id ? { ...lang, active } : lang
      ));
      toast.success(`Language ${active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to update language status:', error);
      toast.error('Failed to update language status');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultLanguage(id);
      setLanguages(languages.map(lang => 
        ({ ...lang, is_default: lang.id === id })
      ));
      toast.success('Default language updated successfully');
    } catch (error) {
      console.error('Failed to set default language:', error);
      toast.error('Failed to set default language');
    }
  };

  const filteredLanguages = languages.filter(language => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        language.name.toLowerCase().includes(searchLower) ||
        language.code.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Language Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setCurrentLanguage(null);
              setIsFormOpen(true);
            }}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
          <Button 
            variant="outline" 
            onClick={loadLanguages}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search languages..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredLanguages.length} of {languages.length} languages
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLanguages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No languages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLanguages.map((language) => (
                  <TableRow key={language.id}>
                    <TableCell className="font-medium">{language.code}</TableCell>
                    <TableCell>{language.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="default_language"
                          checked={language.is_default}
                          onChange={() => handleSetDefault(language.id)}
                          disabled={!language.active}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={language.active}
                        onCheckedChange={(checked) => handleToggleStatus(language.id, checked)}
                        disabled={language.is_default} // Don't allow deactivating default language
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenEditForm(language)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteClick(language)}
                          disabled={language.is_default} // Don't allow deleting default language
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <LanguageForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={loadLanguages}
        existingLanguage={currentLanguage}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Language"
        description={`Are you sure you want to delete the language "${languageToDelete?.name}"? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
};

export default LanguageManagement;
