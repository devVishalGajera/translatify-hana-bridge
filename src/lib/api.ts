
/**
 * API client for communicating with the Node.js backend
 */

// Update this with your actual backend URL
const API_BASE_URL = 'http://localhost:3001/api';

export interface Translation {
  id?: string;
  module: string;
  translation_key: string;
  en: string;
  de: string;
  fr: string;
  es: string;
  active?: boolean;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface Section {
  id: string;
  name: string;
  module: string;
  description?: string;
  active?: boolean;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  active: boolean;
  is_default: boolean;
}

/**
 * Fetch translations for a specific module
 */
export async function fetchTranslations(module?: string): Promise<Translation[]> {
  try {
    const url = module ? `${API_BASE_URL}/translations/${module}` : `${API_BASE_URL}/translations`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching translations:', error);
    // Return mock data for now
    return getMockTranslations(module);
  }
}

/**
 * Add a new translation
 */
export async function addTranslation(translation: Partial<Translation>): Promise<Translation> {
  try {
    const response = await fetch(`${API_BASE_URL}/translations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translation),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add translation: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding translation:', error);
    // Mock response for now
    return {
      id: Date.now().toString(),
      ...translation,
      module: translation.module || '',
      translation_key: translation.translation_key || '',
      en: translation.en || '',
      de: translation.de || '',
      fr: translation.fr || '',
      es: translation.es || '',
      active: true
    };
  }
}

/**
 * Update a translation
 */
export async function updateTranslation(
  module: string,
  key: string,
  language: string,
  value: string
): Promise<{success: boolean}> {
  try {
    const response = await fetch(`${API_BASE_URL}/translations/${module}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        language,
        value,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update translation: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating translation:', error);
    // Mock success for now
    return { success: true };
  }
}

/**
 * Delete a translation
 */
export async function deleteTranslation(id: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/translations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete translation: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting translation:', error);
    // Mock success for now
    return { success: true };
  }
}

/**
 * Toggle translation active status
 */
export async function toggleTranslationStatus(id: string, active: boolean): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/translations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update translation status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating translation status:', error);
    // Mock success for now
    return { success: true };
  }
}

/**
 * Fetch all modules
 */
export async function fetchModules(): Promise<Module[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/modules`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch modules: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching modules:', error);
    // Return mock data
    return [
      { id: 'offboarding', name: 'Offboarding', active: true },
      { id: 'shift_allowance', name: 'Shift Allowance', active: true }
    ];
  }
}

/**
 * Fetch all sections for a module
 */
export async function fetchSections(moduleId?: string): Promise<Section[]> {
  try {
    const url = moduleId ? `${API_BASE_URL}/sections?module=${moduleId}` : `${API_BASE_URL}/sections`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sections: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching sections:', error);
    // Return mock data
    return [
      { id: 'exit_interview', name: 'Exit Interview', module: 'offboarding', active: true },
      { id: 'equipment_return', name: 'Equipment Return', module: 'offboarding', active: true },
      { id: 'final_paycheck', name: 'Final Paycheck', module: 'offboarding', active: true },
      { id: 'night_shift', name: 'Night Shift', module: 'shift_allowance', active: true },
      { id: 'weekend_allowance', name: 'Weekend Allowance', module: 'shift_allowance', active: true },
      { id: 'holiday_pay', name: 'Holiday Pay', module: 'shift_allowance', active: true }
    ].filter(section => !moduleId || section.module === moduleId);
  }
}

/**
 * Fetch all languages
 */
export async function fetchLanguages(): Promise<Language[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch languages: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching languages:', error);
    // Return mock data
    return [
      { id: '1', code: 'en', name: 'English', active: true, is_default: true },
      { id: '2', code: 'de', name: 'German', active: true, is_default: false },
      { id: '3', code: 'fr', name: 'French', active: true, is_default: false },
      { id: '4', code: 'es', name: 'Spanish', active: true, is_default: false },
      { id: '5', code: 'it', name: 'Italian', active: false, is_default: false }
    ];
  }
}

/**
 * Add a new language
 */
export async function addLanguage(language: Partial<Language>): Promise<Language> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(language),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add language: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding language:', error);
    // Mock response for now
    return {
      id: Date.now().toString(),
      code: language.code || '',
      name: language.name || '',
      active: language.active !== undefined ? language.active : true,
      is_default: language.is_default !== undefined ? language.is_default : false
    };
  }
}

/**
 * Update a language
 */
export async function updateLanguage(id: string, language: Partial<Language>): Promise<{ id: string, message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(language),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update language: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating language:', error);
    // Mock response for now
    return { id, message: 'Language updated successfully' };
  }
}

/**
 * Delete a language
 */
export async function deleteLanguage(id: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete language: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting language:', error);
    // Mock success for now
    return { success: true };
  }
}

/**
 * Toggle language active status
 */
export async function toggleLanguageStatus(id: string, active: boolean): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update language status: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating language status:', error);
    // Mock success for now
    return { success: true };
  }
}

/**
 * Set a language as default
 */
export async function setDefaultLanguage(id: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/languages/${id}/default`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to set default language: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error setting default language:', error);
    // Mock success for now
    return { success: true };
  }
}

/**
 * Get mock translations for development
 */
function getMockTranslations(module?: string): Translation[] {
  const allTranslations = [
    {
      id: '1',
      module: 'offboarding',
      translation_key: 'exit_interview',
      en: 'Exit Interview',
      de: 'Austrittsgespräch',
      fr: 'Entretien de départ',
      es: 'Entrevista de salida',
      active: true
    },
    {
      id: '2',
      module: 'offboarding',
      translation_key: 'return_equipment',
      en: 'Return Equipment',
      de: 'Geräterückgabe',
      fr: 'Retour de l\'équipement',
      es: 'Devolución de equipo',
      active: true
    },
    {
      id: '3',
      module: 'offboarding',
      translation_key: 'final_paycheck',
      en: 'Final Paycheck',
      de: 'Letzte Gehaltsabrechnung',
      fr: 'Dernier salaire',
      es: 'Cheque final',
      active: true
    },
    {
      id: '4',
      module: 'shift_allowance',
      translation_key: 'night_shift',
      en: 'Night Shift',
      de: 'Nachtschicht',
      fr: 'Quart de nuit',
      es: 'Turno nocturno',
      active: true
    },
    {
      id: '5',
      module: 'shift_allowance',
      translation_key: 'weekend_allowance',
      en: 'Weekend Allowance',
      de: 'Wochenendzulage',
      fr: 'Allocation de week-end',
      es: 'Subsidio de fin de semana',
      active: true
    },
    {
      id: '6',
      module: 'shift_allowance',
      translation_key: 'holiday_pay',
      en: 'Holiday Pay',
      de: 'Feiertagszuschlag',
      fr: 'Prime de jour férié',
      es: 'Pago por días festivos',
      active: false
    }
  ];
  
  if (module) {
    return allTranslations.filter(t => t.module === module);
  }
  
  return allTranslations;
}
