
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface UploadProps {
  onUploadComplete: () => void;
}

const TranslationUpload: React.FC<UploadProps> = ({ onUploadComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'json' | 'excel'>('json');
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    defaultValues: {
      module: '',
      section: '',
      fileType: 'json'
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isJSON = file.type === 'application/json';
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      
      if ((uploadType === 'json' && !isJSON) || (uploadType === 'excel' && !isExcel)) {
        toast.error(`Please select a ${uploadType === 'json' ? 'JSON' : 'Excel'} file`);
        e.target.value = '';
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUploadTypeChange = (type: 'json' | 'excel') => {
    setUploadType(type);
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (values: { module: string; section: string; }) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Mock file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${uploadType.toUpperCase()} file uploaded successfully`);
      setIsOpen(false);
      setSelectedFile(null);
      form.reset();
      onUploadComplete();
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Translations
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Upload Translations</SheetTitle>
          <SheetDescription>
            Upload JSON or Excel files containing translations for a specific module and section.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex space-x-4 mb-6">
              <Button
                type="button"
                variant={uploadType === 'json' ? 'default' : 'outline'}
                onClick={() => handleUploadTypeChange('json')}
                className="flex-1"
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                type="button"
                variant={uploadType === 'excel' ? 'default' : 'outline'}
                onClick={() => handleUploadTypeChange('excel')}
                className="flex-1"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a module" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="offboarding">Offboarding</SelectItem>
                      <SelectItem value="shift_allowance">Shift Allowance</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="exit_interview">Exit Interview</SelectItem>
                      <SelectItem value="equipment_return">Equipment Return</SelectItem>
                      <SelectItem value="night_shift">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel htmlFor="file-upload">
                Upload {uploadType === 'json' ? 'JSON' : 'Excel'} File
              </FormLabel>
              <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  id="file-upload"
                  type="file"
                  accept={uploadType === 'json' ? '.json' : '.xlsx,.xls'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  {uploadType === 'json' ? 
                    <FileJson className="h-10 w-10 text-gray-400" /> : 
                    <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                  }
                  <div className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : (
                      <span>
                        Drag and drop your {uploadType === 'json' ? 'JSON' : 'Excel'} file here, or{' '}
                        <label 
                          htmlFor="file-upload"
                          className="text-blue-600 cursor-pointer hover:underline"
                        >
                          browse
                        </label>
                      </span>
                    )}
                  </div>
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <SheetFooter>
              <Button 
                type="submit" 
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : 'Upload Translations'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default TranslationUpload;
