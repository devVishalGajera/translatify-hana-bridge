
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Settings, Database, Globe, PanelLeft } from 'lucide-react';

const Index = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">SAP HANA Translation Management</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage translations for SAP HANA modules and sections. Easily translate, import, and export content across multiple languages.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ModuleCard
          title="Module Management"
          description="Create and manage modules for organization"
          icon={<Database className="h-12 w-12" />}
          linkTo="/module-management"
        />
        
        <ModuleCard
          title="Section Management"
          description="Organize modules into logical sections"
          icon={<PanelLeft className="h-12 w-12" />}
          linkTo="/section-management"
        />
        
        <ModuleCard
          title="Translation Management"
          description="Add, edit and translate content across languages"
          icon={<Globe className="h-12 w-12" />}
          linkTo="/translation-management"
        />
        
        <ModuleCard
          title="Offboarding Translations"
          description="Manage translations for the Offboarding module"
          icon={<FileSpreadsheet className="h-12 w-12" />}
          linkTo="/offboarding"
        />
        
        <ModuleCard
          title="Shift Allowance Translations"
          description="Manage translations for the Shift Allowance module"
          icon={<FileSpreadsheet className="h-12 w-12" />}
          linkTo="/shift-allowance"
        />
        
        <ModuleCard
          title="System Configuration"
          description="Configure system settings and parameters"
          icon={<Settings className="h-12 w-12" />}
          linkTo="/configuration"
          disabled={true}
        />
      </div>
      
      <div className="mt-16 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">System Integration</h2>
        <p className="text-sm text-gray-600 mb-4">
          This application connects to your SAP HANA backend for translation management. Ensure your backend API is running to enable full functionality.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded border border-gray-200">
            <h3 className="font-medium">Backend Status</h3>
            <div className="flex items-center mt-2">
              <div className="h-3 w-3 bg-yellow-400 rounded-full mr-2"></div>
              <span>Simulated (Using mock data)</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <h3 className="font-medium">API Endpoint</h3>
            <code className="text-xs bg-gray-100 p-1 rounded mt-2 block overflow-x-auto">
              http://localhost:3001/api
            </code>
          </div>
          <div className="bg-white p-4 rounded border border-gray-200">
            <h3 className="font-medium">Supported Languages</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">English (en)</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">German (de)</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">French (fr)</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Spanish (es)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  disabled?: boolean;
}

const ModuleCard = ({ title, description, icon, linkTo, disabled = false }: ModuleCardProps) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden 
      ${disabled ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}>
      <div className="p-6">
        <div className="flex justify-center mb-4 text-blue-600">{icon}</div>
        <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>
        <p className="text-gray-600 text-center text-sm mb-4">{description}</p>
        {disabled ? (
          <Button variant="outline" className="w-full" disabled>
            Coming Soon
          </Button>
        ) : (
          <Button asChild variant="default" className="w-full">
            <Link to={linkTo}>Access</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
