
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  module_id: string;
  module_name: string;
  description: string;
  created_at: string;
}

const SectionManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      module_id: '',
      description: '',
    },
  });

  useEffect(() => {
    loadModules();
    loadSections();
  }, []);

  useEffect(() => {
    if (editingSection) {
      form.setValue('name', editingSection.name);
      form.setValue('module_id', editingSection.module_id);
      form.setValue('description', editingSection.description);
    } else {
      form.reset();
    }
  }, [editingSection, form]);

  const loadModules = async () => {
    try {
      // Mock data for now, would be replaced with actual API call
      const mockModules: Module[] = [
        { id: '1', name: 'offboarding' },
        { id: '2', name: 'shift_allowance' }
      ];
      setModules(mockModules);
    } catch (err) {
      toast.error('Failed to load modules');
      console.error(err);
    }
  };

  const loadSections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now, would be replaced with actual API call
      const mockSections: Section[] = [
        { 
          id: '1', 
          name: 'exit_interview', 
          module_id: '1', 
          module_name: 'offboarding',
          description: 'Exit interview process', 
          created_at: '2025-01-20' 
        },
        { 
          id: '2', 
          name: 'equipment_return', 
          module_id: '1', 
          module_name: 'offboarding',
          description: 'Company equipment return process', 
          created_at: '2025-01-22' 
        },
        { 
          id: '3', 
          name: 'night_shift', 
          module_id: '2', 
          module_name: 'shift_allowance',
          description: 'Night shift allowance calculations', 
          created_at: '2025-02-25' 
        }
      ];
      setSections(mockSections);
    } catch (err) {
      setError('Failed to load sections. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { name: string; module_id: string; description: string }) => {
    try {
      const selectedModule = modules.find(m => m.id === values.module_id);
      
      if (!selectedModule) {
        toast.error("Please select a valid module");
        return;
      }
      
      if (editingSection) {
        // Update existing section (mock)
        setSections(sections.map(section => 
          section.id === editingSection.id 
            ? { 
                ...section, 
                name: values.name, 
                module_id: values.module_id,
                module_name: selectedModule.name,
                description: values.description 
              } 
            : section
        ));
        toast.success("Section updated successfully");
      } else {
        // Create new section (mock)
        const newSection: Section = {
          id: Date.now().toString(),
          name: values.name,
          module_id: values.module_id,
          module_name: selectedModule.name,
          description: values.description,
          created_at: new Date().toISOString().split('T')[0]
        };
        setSections([...sections, newSection]);
        toast.success("Section created successfully");
      }
      form.reset();
      setEditingSection(null);
    } catch (error) {
      toast.error("Failed to save section");
      console.error(error);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
  };

  const handleDelete = async (id: string) => {
    try {
      // Mock deletion
      setSections(sections.filter(section => section.id !== id));
      toast.success("Section deleted successfully");
      if (editingSection?.id === id) {
        setEditingSection(null);
        form.reset();
      }
    } catch (error) {
      toast.error("Failed to delete section");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Section Management</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={loadSections}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">
            {editingSection ? 'Edit Section' : 'Create New Section'}
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="module_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter section name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter section description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingSection ? 'Update' : 'Create'}
                </Button>
                {editingSection && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingSection(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">All Sections</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              {error}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Section Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        No sections found. Create your first section.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell>{section.module_name}</TableCell>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>{section.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(section)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(section.id)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionManagement;
