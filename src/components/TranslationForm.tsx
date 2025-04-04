
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Translation } from '@/lib/api';

interface TranslationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (translation: Partial<Translation>) => Promise<void>;
  translation?: Translation;
  modules: { id: string; name: string }[];
  sections: { id: string; name: string; module: string }[];
}

const TranslationForm: React.FC<TranslationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  translation,
  modules,
  sections,
}) => {
  const [formData, setFormData] = useState<Partial<Translation>>({
    module: '',
    translation_key: '',
    en: '',
    de: '',
    fr: '',
    es: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');

  useEffect(() => {
    if (translation) {
      setFormData(translation);
      setSelectedModule(translation.module);
    } else {
      setFormData({
        module: '',
        translation_key: '',
        en: '',
        de: '',
        fr: '',
        es: '',
      });
      setSelectedModule('');
    }
  }, [translation, isOpen]);

  const handleChange = (field: keyof Translation, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (value: string) => {
    setSelectedModule(value);
    setFormData((prev) => ({ ...prev, module: value, translation_key: '' }));
  };

  const handleSectionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, translation_key: value }));
  };

  const handleSubmit = async () => {
    if (!formData.module || !formData.translation_key || !formData.en) {
      toast.error('Module, section, and English translation are required');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(translation ? 'Translation updated successfully' : 'Translation added successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting translation:', error);
      toast.error('Failed to save translation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = sections.filter(
    (section) => !selectedModule || section.module === selectedModule
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{translation ? 'Edit Translation' : 'Add New Translation'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="module" className="text-right">
              Module
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.module}
                onValueChange={handleModuleChange}
                disabled={loading || !!translation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="section" className="text-right">
              Section
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.translation_key}
                onValueChange={handleSectionChange}
                disabled={loading || !formData.module || !!translation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="en" className="text-right">
              English
            </Label>
            <div className="col-span-3">
              <Input
                id="en"
                value={formData.en || ''}
                onChange={(e) => handleChange('en', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="de" className="text-right">
              German
            </Label>
            <div className="col-span-3">
              <Input
                id="de"
                value={formData.de || ''}
                onChange={(e) => handleChange('de', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fr" className="text-right">
              French
            </Label>
            <div className="col-span-3">
              <Input
                id="fr"
                value={formData.fr || ''}
                onChange={(e) => handleChange('fr', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="es" className="text-right">
              Spanish
            </Label>
            <div className="col-span-3">
              <Input
                id="es"
                value={formData.es || ''}
                onChange={(e) => handleChange('es', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : translation ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationForm;
