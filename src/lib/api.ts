
/**
 * API client for communicating with the Node.js backend
 */

// Update this with your actual backend URL
const API_BASE_URL = 'http://localhost:3001/api';

export interface Translation {
  module: string;
  translation_key: string;
  en: string;
  de: string;
  fr: string;
  es: string;
}

/**
 * Fetch translations for a specific module
 */
export async function fetchTranslations(module: string): Promise<Translation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/translations/${module}`);
    
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
 * Get mock translations for development
 */
function getMockTranslations(module: string): Translation[] {
  if (module === 'offboarding') {
    return [
      {
        module: 'offboarding',
        translation_key: 'exit_interview',
        en: 'Exit Interview',
        de: 'Austrittsgespräch',
        fr: 'Entretien de départ',
        es: 'Entrevista de salida'
      },
      {
        module: 'offboarding',
        translation_key: 'return_equipment',
        en: 'Return Equipment',
        de: 'Geräterückgabe',
        fr: 'Retour de l\'équipement',
        es: 'Devolución de equipo'
      },
      {
        module: 'offboarding',
        translation_key: 'final_paycheck',
        en: 'Final Paycheck',
        de: 'Letzte Gehaltsabrechnung',
        fr: 'Dernier salaire',
        es: 'Cheque final'
      }
    ];
  } else if (module === 'shift_allowance') {
    return [
      {
        module: 'shift_allowance',
        translation_key: 'night_shift',
        en: 'Night Shift',
        de: 'Nachtschicht',
        fr: 'Quart de nuit',
        es: 'Turno nocturno'
      },
      {
        module: 'shift_allowance',
        translation_key: 'weekend_allowance',
        en: 'Weekend Allowance',
        de: 'Wochenendzulage',
        fr: 'Allocation de week-end',
        es: 'Subsidio de fin de semana'
      },
      {
        module: 'shift_allowance',
        translation_key: 'holiday_pay',
        en: 'Holiday Pay',
        de: 'Feiertagszuschlag',
        fr: 'Prime de jour férié',
        es: 'Pago por días festivos'
      }
    ];
  }
  
  return [];
}
