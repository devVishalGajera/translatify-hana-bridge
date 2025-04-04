
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Translation, updateTranslation } from '@/lib/api';

interface TranslationTableProps {
  translations: Translation[];
  module: string;
  onUpdate?: () => void;
}

const TranslationTable: React.FC<TranslationTableProps> = ({ 
  translations, 
  module,
  onUpdate 
}) => {
  const [editingCell, setEditingCell] = useState<{
    key: string;
    language: string;
  } | null>(null);
  
  const [editValue, setEditValue] = useState('');
  
  const handleEdit = (key: string, language: string, currentValue: string) => {
    setEditingCell({ key, language });
    setEditValue(currentValue);
  };
  
  const handleSave = async () => {
    if (!editingCell) return;
    
    try {
      await updateTranslation(
        module,
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Key</TableHead>
            <TableHead>English</TableHead>
            <TableHead>German</TableHead>
            <TableHead>French</TableHead>
            <TableHead>Spanish</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {translations.map((translation) => (
            <TableRow key={translation.translation_key}>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TranslationTable;
