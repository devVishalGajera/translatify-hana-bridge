
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const ModuleManagement = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (editingModule) {
      form.setValue('name', editingModule.name);
      form.setValue('description', editingModule.description);
    } else {
      form.reset();
    }
  }, [editingModule, form]);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data for now, would be replaced with actual API call
      const mockModules: Module[] = [
        { id: '1', name: 'offboarding', description: 'Employee offboarding module', created_at: '2025-01-15' },
        { id: '2', name: 'shift_allowance', description: 'Shift allowance calculation', created_at: '2025-02-20' }
      ];
      setModules(mockModules);
    } catch (err) {
      setError('Failed to load modules. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      if (editingModule) {
        // Update existing module (mock)
        setModules(modules.map(mod => 
          mod.id === editingModule.id 
            ? { ...mod, name: values.name, description: values.description } 
            : mod
        ));
        toast.success("Module updated successfully");
      } else {
        // Create new module (mock)
        const newModule: Module = {
          id: Date.now().toString(),
          name: values.name,
          description: values.description,
          created_at: new Date().toISOString().split('T')[0]
        };
        setModules([...modules, newModule]);
        toast.success("Module created successfully");
      }
      form.reset();
      setEditingModule(null);
    } catch (error) {
      toast.error("Failed to save module");
      console.error(error);
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
  };

  const handleDelete = async (id: string) => {
    try {
      // Mock deletion
      setModules(modules.filter(module => module.id !== id));
      toast.success("Module deleted successfully");
      if (editingModule?.id === id) {
        setEditingModule(null);
        form.reset();
      }
    } catch (error) {
      toast.error("Failed to delete module");
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
          <h1 className="text-2xl font-bold">Module Management</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={loadModules}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">
            {editingModule ? 'Edit Module' : 'Create New Module'}
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter module name" {...field} />
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
                      <Input placeholder="Enter module description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingModule ? 'Update' : 'Create'}
                </Button>
                {editingModule && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingModule(null);
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
          <h2 className="text-lg font-semibold mb-4">All Modules</h2>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        No modules found. Create your first module.
                      </TableCell>
                    </TableRow>
                  ) : (
                    modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.name}</TableCell>
                        <TableCell>{module.description}</TableCell>
                        <TableCell>{module.created_at}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(module)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(module.id)}
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

export default ModuleManagement;
