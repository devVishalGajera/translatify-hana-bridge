
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Translation, updateTranslation, toggleTranslationStatus, deleteTranslation } from '@/lib/api';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import TranslationForm from './TranslationForm';

interface TranslationTableProps {
  translations: Translation[];
  module?: string;
  onUpdate?: () => void;
  modules: { id: string; name: string }[];
  sections: { id: string; name: string; module: string }[];
}

const TranslationTable: React.FC<TranslationTableProps> = ({ 
  translations, 
  module,
  onUpdate,
  modules,
  sections
}) => {
  const [editingCell, setEditingCell] = useState<{
    key: string;
    language: string;
  } | null>(null);
  
  const [editValue, setEditValue] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState<Translation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [translationToEdit, setTranslationToEdit] = useState<Translation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleEdit = (key: string, language: string, currentValue: string) => {
    setEditingCell({ key, language });
    setEditValue(currentValue);
  };
  
  const handleSave = async () => {
    if (!editingCell) return;
    
    try {
      await updateTranslation(
        module || '',
        editingCell.key,
        editingCell.language,
        editValue
      );
      
      // Reset editing state
      setEditingCell(null);
      
      // Call parent update callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update translation:', error);
    }
  };
  
  const handleCancel = () => {
    setEditingCell(null);
  };

  const handleDeleteClick = (translation: Translation) => {
    setTranslationToDelete(translation);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!translationToDelete || !translationToDelete.id) return;
    
    setIsProcessing(true);
    try {
      await deleteTranslation(translationToDelete.id);
      toast.success('Translation deleted successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete translation:', error);
      toast.error('Failed to delete translation');
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
      setTranslationToDelete(null);
    }
  };

  const handleToggleStatus = async (translation: Translation) => {
    if (!translation.id) return;
    
    try {
      const newStatus = !translation.active;
      await toggleTranslationStatus(translation.id, newStatus);
      toast.success(`Translation ${newStatus ? 'activated' : 'deactivated'} successfully`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update translation status:', error);
      toast.error('Failed to update translation status');
    }
  };

  const handleEditClick = (translation: Translation) => {
    setTranslationToEdit(translation);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (updatedTranslation: Partial<Translation>) => {
    try {
      // In this simple form we'll just update all fields
      for (const lang of ['en', 'de', 'fr', 'es'] as const) {
        if (translationToEdit && translationToEdit[lang] !== updatedTranslation[lang]) {
          await updateTranslation(
            translationToEdit.module,
            translationToEdit.translation_key,
            lang,
            updatedTranslation[lang] || ''
          );
        }
      }
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update translation:', error);
      throw error;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Key</TableHead>
              <TableHead>English</TableHead>
              <TableHead>German</TableHead>
              <TableHead>French</TableHead>
              <TableHead>Spanish</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No translations found
                </TableCell>
              </TableRow>
            ) : (
              translations.map((translation) => (
                <TableRow 
                  key={`${translation.module}-${translation.translation_key}`}
                  className={!translation.active ? "opacity-60" : ""}
                >
                  <TableCell className="font-medium">{translation.translation_key}</TableCell>
                  
                  {/* English */}
                  <TableCell>
                    {editingCell?.key === translation.translation_key && 
                    editingCell?.language === 'en' ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full"
                        />
                        <Button size="sm" onClick={handleSave}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleEdit(translation.translation_key, 'en', translation.en)}
                      >
                        {translation.en}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* German */}
                  <TableCell>
                    {editingCell?.key === translation.translation_key && 
                    editingCell?.language === 'de' ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full"
                        />
                        <Button size="sm" onClick={handleSave}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleEdit(translation.translation_key, 'de', translation.de)}
                      >
                        {translation.de}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* French */}
                  <TableCell>
                    {editingCell?.key === translation.translation_key && 
                    editingCell?.language === 'fr' ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full"
                        />
                        <Button size="sm" onClick={handleSave}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleEdit(translation.translation_key, 'fr', translation.fr)}
                      >
                        {translation.fr}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Spanish */}
                  <TableCell>
                    {editingCell?.key === translation.translation_key && 
                    editingCell?.language === 'es' ? (
                      <div className="flex gap-2">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full"
                        />
                        <Button size="sm" onClick={handleSave}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleEdit(translation.translation_key, 'es', translation.es)}
                      >
                        {translation.es}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(translation)}
                        title="Edit translation"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(translation)}
                        title={translation.active ? "Deactivate" : "Activate"}
                      >
                        {translation.active ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(translation)}
                        title="Delete translation"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Translation"
        description="Are you sure you want to delete this translation? This action cannot be undone."
        loading={isProcessing}
      />

      <TranslationForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTranslationToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        translation={translationToEdit || undefined}
        modules={modules}
        sections={sections}
      />
    </>
  );
};

export default TranslationTable;
