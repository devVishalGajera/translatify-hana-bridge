
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { addLanguage, updateLanguage } from '@/lib/api';
import { Language } from '@/pages/LanguageManagement';

interface LanguageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  existingLanguage: Language | null;
}

const LanguageForm: React.FC<LanguageFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingLanguage
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    active: true,
    is_default: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingLanguage) {
      setFormData({
        code: existingLanguage.code,
        name: existingLanguage.name,
        active: existingLanguage.active,
        is_default: existingLanguage.is_default
      });
    } else {
      setFormData({
        code: '',
        name: '',
        active: true,
        is_default: false
      });
    }
    setErrors({});
  }, [existingLanguage, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Language code is required';
    } else if (formData.code.length > 5) {
      newErrors.code = 'Language code must be 5 characters or less';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Language name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (existingLanguage) {
        await updateLanguage(existingLanguage.id, formData);
        toast.success('Language updated successfully');
      } else {
        await addLanguage(formData);
        toast.success('Language added successfully');
      }
      
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting language:', error);
      toast.error(existingLanguage 
        ? 'Failed to update language' 
        : 'Failed to add language'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingLanguage ? 'Edit Language' : 'Add New Language'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Language Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="en"
                value={formData.code}
                onChange={handleChange}
                disabled={isSubmitting || (existingLanguage?.is_default || false)}
              />
              {errors.code && (
                <p className="text-red-500 text-sm">{errors.code}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Language Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="English"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="flex-1">Active</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                disabled={isSubmitting || formData.is_default}
              />
            </div>
            
            {!existingLanguage && (
              <div className="flex items-center justify-between">
                <Label htmlFor="is_default" className="flex-1">Set as Default</Label>
                <Switch
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => {
                    handleSwitchChange('is_default', checked);
                    if (checked) {
                      // Force active to true if it's default
                      handleSwitchChange('active', true);
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : existingLanguage ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageForm;
