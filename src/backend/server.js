
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
const hana = require('@sap/hana-client');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SAP HANA Connection
const connectionParams = {
  serverNode: process.env.HANA_HOST || 'localhost:30015',  // Replace with your HANA server
  uid: process.env.HANA_USER || 'SYSTEM',                  // Replace with your HANA username
  pwd: process.env.HANA_PASSWORD || 'Password123',         // Replace with your HANA password
  encrypt: 'true',                                         // Use encryption
  sslValidateCertificate: 'false',                         // For dev environments, can be true in prod
};

// Get HANA connection
function getConnection() {
  try {
    const conn = hana.createConnection();
    conn.connect(connectionParams);
    return conn;
  } catch (err) {
    console.error('Error connecting to HANA:', err);
    throw err;
  }
}

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Mock data (for development without HANA)
let mockData = {
  modules: [
    { id: 'offboarding', name: 'Offboarding', description: 'Offboarding processes', active: true },
    { id: 'shift_allowance', name: 'Shift Allowance', description: 'Shift allowance management', active: true }
  ],
  sections: [
    { id: 'exit_interview', name: 'Exit Interview', module: 'offboarding', description: 'Employee exit interview process', active: true },
    { id: 'equipment_return', name: 'Equipment Return', module: 'offboarding', description: 'Equipment return process', active: true },
    { id: 'final_paycheck', name: 'Final Paycheck', module: 'offboarding', description: 'Final paycheck process', active: true },
    { id: 'night_shift', name: 'Night Shift', module: 'shift_allowance', description: 'Night shift allowances', active: true },
    { id: 'weekend_allowance', name: 'Weekend Allowance', module: 'shift_allowance', description: 'Weekend work allowances', active: true },
    { id: 'holiday_pay', name: 'Holiday Pay', module: 'shift_allowance', description: 'Holiday pay calculations', active: true }
  ],
  translations: [
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
  ]
};

// Helper function to execute SQL on HANA
async function executeHanaQuery(sql, params = []) {
  let conn;
  try {
    conn = getConnection();
    const result = await conn.exec(sql, params);
    return result;
  } catch (err) {
    console.error('HANA query error:', err);
    throw err;
  } finally {
    if (conn) {
      try {
        conn.disconnect();
      } catch (e) {
        console.error('Error disconnecting from HANA:', e);
      }
    }
  }
}

// API Routes

// Get all modules
app.get('/api/modules', async (req, res) => {
  try {
    // Uncomment for HANA integration
    /*
    const sql = `SELECT 
                  MODULE_ID as id, 
                  MODULE_NAME as name, 
                  DESCRIPTION as description,
                  ACTIVE as active
                FROM TRANSLATION_MODULES
                ORDER BY MODULE_NAME`;
    const modules = await executeHanaQuery(sql);
    res.json(modules);
    */
    
    // Mock response
    res.json(mockData.modules);
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Create a new module
app.post('/api/modules', async (req, res) => {
  try {
    const { id, name, description } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ error: 'Module ID and name are required' });
    }
    
    // Uncomment for HANA integration
    /*
    const sql = `INSERT INTO TRANSLATION_MODULES 
                  (MODULE_ID, MODULE_NAME, DESCRIPTION, ACTIVE) 
                VALUES (?, ?, ?, 1)`;
    await executeHanaQuery(sql, [id, name, description || null]);
    */
    
    // Mock response
    const newModule = {
      id,
      name,
      description: description || '',
      active: true
    };
    mockData.modules.push(newModule);
    
    res.status(201).json(newModule);
  } catch (err) {
    console.error('Error creating module:', err);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update a module
app.put('/api/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    
    // Uncomment for HANA integration
    /*
    const sql = `UPDATE TRANSLATION_MODULES 
                SET MODULE_NAME = ?, 
                    DESCRIPTION = ?, 
                    ACTIVE = ? 
                WHERE MODULE_ID = ?`;
    await executeHanaQuery(sql, [name, description, active ? 1 : 0, id]);
    */
    
    // Mock response
    const moduleIndex = mockData.modules.findIndex(m => m.id === id);
    if (moduleIndex === -1) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    mockData.modules[moduleIndex] = {
      ...mockData.modules[moduleIndex],
      name: name || mockData.modules[moduleIndex].name,
      description: description !== undefined ? description : mockData.modules[moduleIndex].description,
      active: active !== undefined ? active : mockData.modules[moduleIndex].active
    };
    
    res.json(mockData.modules[moduleIndex]);
  } catch (err) {
    console.error('Error updating module:', err);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete a module
app.delete('/api/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Uncomment for HANA integration
    /*
    // First check if module has sections or translations
    const checkSql = `SELECT COUNT(*) as count 
                      FROM TRANSLATION_SECTIONS 
                      WHERE MODULE_ID = ?`;
    const sectionCheck = await executeHanaQuery(checkSql, [id]);
    
    if (sectionCheck[0].COUNT > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete module with associated sections. Remove sections first.' 
      });
    }
    
    const deleteSql = `DELETE FROM TRANSLATION_MODULES WHERE MODULE_ID = ?`;
    await executeHanaQuery(deleteSql, [id]);
    */
    
    // Mock response
    // Check if module has sections
    const hasRelatedSections = mockData.sections.some(s => s.module === id);
    if (hasRelatedSections) {
      return res.status(400).json({ 
        error: 'Cannot delete module with associated sections. Remove sections first.' 
      });
    }
    
    mockData.modules = mockData.modules.filter(m => m.id !== id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting module:', err);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// Get all sections (optionally filtered by module)
app.get('/api/sections', async (req, res) => {
  try {
    const { module } = req.query;
    
    // Uncomment for HANA integration
    /*
    let sql = `SELECT 
                SECTION_ID as id, 
                SECTION_NAME as name, 
                MODULE_ID as module,
                DESCRIPTION as description,
                ACTIVE as active
              FROM TRANSLATION_SECTIONS`;
    
    const params = [];
    if (module) {
      sql += ` WHERE MODULE_ID = ?`;
      params.push(module);
    }
    
    sql += ` ORDER BY SECTION_NAME`;
    
    const sections = await executeHanaQuery(sql, params);
    res.json(sections);
    */
    
    // Mock response
    let sections = [...mockData.sections];
    if (module) {
      sections = sections.filter(s => s.module === module);
    }
    
    res.json(sections);
  } catch (err) {
    console.error('Error fetching sections:', err);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Create a new section
app.post('/api/sections', async (req, res) => {
  try {
    const { id, name, module, description } = req.body;
    
    if (!id || !name || !module) {
      return res.status(400).json({ error: 'Section ID, name, and module are required' });
    }
    
    // Check if module exists
    const moduleExists = mockData.modules.some(m => m.id === module);
    if (!moduleExists) {
      return res.status(400).json({ error: 'Module does not exist' });
    }
    
    // Uncomment for HANA integration
    /*
    const sql = `INSERT INTO TRANSLATION_SECTIONS 
                  (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE) 
                VALUES (?, ?, ?, ?, 1)`;
    await executeHanaQuery(sql, [id, name, module, description || null]);
    */
    
    // Mock response
    const newSection = {
      id,
      name,
      module,
      description: description || '',
      active: true
    };
    mockData.sections.push(newSection);
    
    res.status(201).json(newSection);
  } catch (err) {
    console.error('Error creating section:', err);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update a section
app.put('/api/sections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    
    // Uncomment for HANA integration
    /*
    const sql = `UPDATE TRANSLATION_SECTIONS 
                SET SECTION_NAME = ?, 
                    DESCRIPTION = ?, 
                    ACTIVE = ? 
                WHERE SECTION_ID = ?`;
    await executeHanaQuery(sql, [name, description, active ? 1 : 0, id]);
    */
    
    // Mock response
    const sectionIndex = mockData.sections.findIndex(s => s.id === id);
    if (sectionIndex === -1) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    mockData.sections[sectionIndex] = {
      ...mockData.sections[sectionIndex],
      name: name || mockData.sections[sectionIndex].name,
      description: description !== undefined ? description : mockData.sections[sectionIndex].description,
      active: active !== undefined ? active : mockData.sections[sectionIndex].active
    };
    
    res.json(mockData.sections[sectionIndex]);
  } catch (err) {
    console.error('Error updating section:', err);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete a section
app.delete('/api/sections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Uncomment for HANA integration
    /*
    // First check if section has translations
    const checkSql = `SELECT COUNT(*) as count 
                      FROM TRANSLATIONS 
                      WHERE SECTION_ID = ?`;
    const translationCheck = await executeHanaQuery(checkSql, [id]);
    
    if (translationCheck[0].COUNT > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete section with associated translations. Remove translations first.' 
      });
    }
    
    const deleteSql = `DELETE FROM TRANSLATION_SECTIONS WHERE SECTION_ID = ?`;
    await executeHanaQuery(deleteSql, [id]);
    */
    
    // Mock response
    // Check if section has translations
    const hasRelatedTranslations = mockData.translations.some(t => t.translation_key === id);
    if (hasRelatedTranslations) {
      return res.status(400).json({ 
        error: 'Cannot delete section with associated translations. Remove translations first.' 
      });
    }
    
    mockData.sections = mockData.sections.filter(s => s.id !== id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting section:', err);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Get all translations (optionally filtered by module)
app.get('/api/translations', async (req, res) => {
  try {
    // Uncomment for HANA integration
    /*
    const sql = `SELECT 
                  t.TRANSLATION_ID as id,
                  s.MODULE_ID as module,
                  t.SECTION_ID as translation_key,
                  t.EN, t.DE, t.FR, t.ES,
                  t.ACTIVE as active
                FROM TRANSLATIONS t
                JOIN TRANSLATION_SECTIONS s ON t.SECTION_ID = s.SECTION_ID
                ORDER BY s.MODULE_ID, t.SECTION_ID`;
    
    const translations = await executeHanaQuery(sql);
    res.json(translations);
    */
    
    // Mock response
    res.json(mockData.translations);
  } catch (err) {
    console.error('Error fetching translations:', err);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

// Get translations for a specific module
app.get('/api/translations/:module', async (req, res) => {
  try {
    const { module } = req.params;
    
    // Uncomment for HANA integration
    /*
    const sql = `SELECT 
                  t.TRANSLATION_ID as id,
                  s.MODULE_ID as module,
                  t.SECTION_ID as translation_key,
                  t.EN, t.DE, t.FR, t.ES,
                  t.ACTIVE as active
                FROM TRANSLATIONS t
                JOIN TRANSLATION_SECTIONS s ON t.SECTION_ID = s.SECTION_ID
                WHERE s.MODULE_ID = ?
                ORDER BY t.SECTION_ID`;
    
    const translations = await executeHanaQuery(sql, [module]);
    res.json(translations);
    */
    
    // Mock response
    const moduleTranslations = mockData.translations.filter(t => t.module === module);
    res.json(moduleTranslations);
  } catch (err) {
    console.error('Error fetching translations for module:', err);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

// Add a new translation
app.post('/api/translations', async (req, res) => {
  try {
    const { module, translation_key, en, de, fr, es } = req.body;
    
    if (!module || !translation_key || !en) {
      return res.status(400).json({ error: 'Module, translation key, and English translation are required' });
    }
    
    // Uncomment for HANA integration
    /*
    // First check if section exists
    const sectionSql = `SELECT COUNT(*) as count 
                        FROM TRANSLATION_SECTIONS 
                        WHERE SECTION_ID = ? AND MODULE_ID = ?`;
    const sectionCheck = await executeHanaQuery(sectionSql, [translation_key, module]);
    
    if (sectionCheck[0].COUNT === 0) {
      return res.status(400).json({ error: 'Section does not exist in the specified module' });
    }
    
    // Check if translation already exists
    const checkSql = `SELECT COUNT(*) as count 
                      FROM TRANSLATIONS 
                      WHERE SECTION_ID = ?`;
    const translationCheck = await executeHanaQuery(checkSql, [translation_key]);
    
    if (translationCheck[0].COUNT > 0) {
      return res.status(400).json({ error: 'Translation for this key already exists' });
    }
    
    const sql = `INSERT INTO TRANSLATIONS 
                  (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE) 
                VALUES (?, ?, ?, ?, ?, ?, 1)`;
    
    const translationId = uuidv4();
    await executeHanaQuery(sql, [
      translationId, 
      translation_key, 
      en, 
      de || '', 
      fr || '', 
      es || ''
    ]);
    */
    
    // Mock response
    // Check if section exists
    const sectionExists = mockData.sections.some(
      s => s.id === translation_key && s.module === module
    );
    
    if (!sectionExists) {
      return res.status(400).json({ error: 'Section does not exist in the specified module' });
    }
    
    // Check if translation already exists
    const translationExists = mockData.translations.some(
      t => t.translation_key === translation_key
    );
    
    if (translationExists) {
      return res.status(400).json({ error: 'Translation for this key already exists' });
    }
    
    const newTranslation = {
      id: uuidv4(),
      module,
      translation_key,
      en,
      de: de || '',
      fr: fr || '',
      es: es || '',
      active: true
    };
    
    mockData.translations.push(newTranslation);
    
    res.status(201).json(newTranslation);
  } catch (err) {
    console.error('Error creating translation:', err);
    res.status(500).json({ error: 'Failed to create translation' });
  }
});

// Update translation for specific language
app.post('/api/translations/:module', async (req, res) => {
  try {
    const { module } = req.params;
    const { key, language, value } = req.body;
    
    if (!key || !language || !value) {
      return res.status(400).json({ error: 'Translation key, language, and value are required' });
    }
    
    if (!['en', 'de', 'fr', 'es'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Supported languages: en, de, fr, es' });
    }
    
    // Uncomment for HANA integration
    /*
    // First check if translation exists
    const checkSql = `SELECT COUNT(*) as count 
                      FROM TRANSLATIONS t
                      JOIN TRANSLATION_SECTIONS s ON t.SECTION_ID = s.SECTION_ID
                      WHERE t.SECTION_ID = ? AND s.MODULE_ID = ?`;
    const translationCheck = await executeHanaQuery(checkSql, [key, module]);
    
    if (translationCheck[0].COUNT === 0) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    
    // Update the translation for the specific language
    const sql = `UPDATE TRANSLATIONS 
                SET ${language.toUpperCase()} = ? 
                WHERE SECTION_ID = ?`;
    
    await executeHanaQuery(sql, [value, key]);
    */
    
    // Mock response
    const translationIndex = mockData.translations.findIndex(
      t => t.translation_key === key && t.module === module
    );
    
    if (translationIndex === -1) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    
    mockData.translations[translationIndex] = {
      ...mockData.translations[translationIndex],
      [language]: value
    };
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating translation:', err);
    res.status(500).json({ error: 'Failed to update translation' });
  }
});

// Delete a translation
app.delete('/api/translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Uncomment for HANA integration
    /*
    const sql = `DELETE FROM TRANSLATIONS WHERE TRANSLATION_ID = ?`;
    await executeHanaQuery(sql, [id]);
    */
    
    // Mock response
    const translationIndex = mockData.translations.findIndex(t => t.id === id);
    if (translationIndex === -1) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    
    mockData.translations = mockData.translations.filter(t => t.id !== id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting translation:', err);
    res.status(500).json({ error: 'Failed to delete translation' });
  }
});

// Toggle translation active status
app.put('/api/translations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ error: 'Active status is required' });
    }
    
    // Uncomment for HANA integration
    /*
    const sql = `UPDATE TRANSLATIONS SET ACTIVE = ? WHERE TRANSLATION_ID = ?`;
    await executeHanaQuery(sql, [active ? 1 : 0, id]);
    */
    
    // Mock response
    const translationIndex = mockData.translations.findIndex(t => t.id === id);
    if (translationIndex === -1) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    
    mockData.translations[translationIndex] = {
      ...mockData.translations[translationIndex],
      active
    };
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating translation status:', err);
    res.status(500).json({ error: 'Failed to update translation status' });
  }
});

// Upload translations from Excel or JSON
app.post('/api/translations/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    
    let translations = [];
    
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      // Process Excel file
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      // Expected columns: module, translation_key, en, de, fr, es
      translations = data.map(row => ({
        module: row.module,
        translation_key: row.translation_key,
        en: row.en || '',
        de: row.de || '',
        fr: row.fr || '',
        es: row.es || ''
      }));
    } else if (fileExt === 'json') {
      // Process JSON file
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      translations = Array.isArray(data) ? data : [data];
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload Excel or JSON files.' });
    }
    
    // Validate and process translations
    const results = {
      success: 0,
      errors: []
    };
    
    for (const translation of translations) {
      if (!translation.module || !translation.translation_key || !translation.en) {
        results.errors.push({
          translation,
          error: 'Missing required fields (module, translation_key, en)'
        });
        continue;
      }
      
      try {
        // Check if section exists
        const sectionExists = mockData.sections.some(
          s => s.id === translation.translation_key && s.module === translation.module
        );
        
        if (!sectionExists) {
          results.errors.push({
            translation,
            error: 'Section does not exist in the specified module'
          });
          continue;
        }
        
        // Check if translation already exists
        const existingTranslation = mockData.translations.find(
          t => t.translation_key === translation.translation_key
        );
        
        if (existingTranslation) {
          // Update existing translation
          Object.assign(existingTranslation, {
            en: translation.en || existingTranslation.en,
            de: translation.de || existingTranslation.de,
            fr: translation.fr || existingTranslation.fr,
            es: translation.es || existingTranslation.es
          });
        } else {
          // Add new translation
          mockData.translations.push({
            id: uuidv4(),
            module: translation.module,
            translation_key: translation.translation_key,
            en: translation.en,
            de: translation.de || '',
            fr: translation.fr || '',
            es: translation.es || '',
            active: true
          });
        }
        
        results.success++;
      } catch (err) {
        console.error('Error processing translation:', err);
        results.errors.push({
          translation,
          error: 'Processing error'
        });
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error('Error uploading translations:', err);
    res.status(500).json({ error: 'Failed to process uploaded file' });
  }
});

// SAP HANA Database Schema Setup Script
const hanaSetupScript = `
-- Create TRANSLATION_MODULES table
CREATE TABLE TRANSLATION_MODULES (
    MODULE_ID NVARCHAR(50) PRIMARY KEY,
    MODULE_NAME NVARCHAR(100) NOT NULL,
    DESCRIPTION NVARCHAR(500),
    ACTIVE BOOLEAN DEFAULT TRUE
);

-- Create TRANSLATION_SECTIONS table
CREATE TABLE TRANSLATION_SECTIONS (
    SECTION_ID NVARCHAR(50) PRIMARY KEY,
    SECTION_NAME NVARCHAR(100) NOT NULL,
    MODULE_ID NVARCHAR(50) NOT NULL,
    DESCRIPTION NVARCHAR(500),
    ACTIVE BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (MODULE_ID) REFERENCES TRANSLATION_MODULES(MODULE_ID)
);

-- Create TRANSLATIONS table
CREATE TABLE TRANSLATIONS (
    TRANSLATION_ID NVARCHAR(36) PRIMARY KEY,
    SECTION_ID NVARCHAR(50) NOT NULL,
    EN NVARCHAR(1000) NOT NULL,
    DE NVARCHAR(1000),
    FR NVARCHAR(1000),
    ES NVARCHAR(1000),
    ACTIVE BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (SECTION_ID) REFERENCES TRANSLATION_SECTIONS(SECTION_ID)
);

-- Create stored procedure for initializing sample data
CREATE PROCEDURE INITIALIZE_TRANSLATION_DATA()
AS
BEGIN
    -- Insert sample modules
    INSERT INTO TRANSLATION_MODULES (MODULE_ID, MODULE_NAME, DESCRIPTION, ACTIVE)
    VALUES ('offboarding', 'Offboarding', 'Offboarding processes', TRUE);
    
    INSERT INTO TRANSLATION_MODULES (MODULE_ID, MODULE_NAME, DESCRIPTION, ACTIVE)
    VALUES ('shift_allowance', 'Shift Allowance', 'Shift allowance management', TRUE);
    
    -- Insert sample sections
    INSERT INTO TRANSLATION_SECTIONS (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE)
    VALUES ('exit_interview', 'Exit Interview', 'offboarding', 'Employee exit interview process', TRUE);
    
    INSERT INTO TRANSLATION_SECTIONS (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE)
    VALUES ('equipment_return', 'Equipment Return', 'offboarding', 'Equipment return process', TRUE);
    
    INSERT INTO TRANSLATION_SECTIONS (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE)
    VALUES ('final_paycheck', 'Final Paycheck', 'offboarding', 'Final paycheck process', TRUE);
    
    INSERT INTO TRANSLATION_SECTIONS (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE)
    VALUES ('night_shift', 'Night Shift', 'shift_allowance', 'Night shift allowances', TRUE);
    
    INSERT INTO TRANSLATION_SECTIONS (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE)
    VALUES ('weekend_allowance', 'Weekend Allowance', 'shift_allowance', 'Weekend work allowances', TRUE);
    
    INSERT INTO TRANSLATION_SECTIONS (SECTION_ID, SECTION_NAME, MODULE_ID, DESCRIPTION, ACTIVE)
    VALUES ('holiday_pay', 'Holiday Pay', 'shift_allowance', 'Holiday pay calculations', TRUE);
    
    -- Insert sample translations
    INSERT INTO TRANSLATIONS (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE)
    VALUES (
        '1', 
        'exit_interview', 
        'Exit Interview', 
        'Austrittsgespräch', 
        'Entretien de départ', 
        'Entrevista de salida', 
        TRUE
    );
    
    INSERT INTO TRANSLATIONS (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE)
    VALUES (
        '2', 
        'equipment_return', 
        'Return Equipment', 
        'Geräterückgabe', 
        'Retour de l''équipement', 
        'Devolución de equipo', 
        TRUE
    );
    
    INSERT INTO TRANSLATIONS (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE)
    VALUES (
        '3', 
        'final_paycheck', 
        'Final Paycheck', 
        'Letzte Gehaltsabrechnung', 
        'Dernier salaire', 
        'Cheque final', 
        TRUE
    );
    
    INSERT INTO TRANSLATIONS (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE)
    VALUES (
        '4', 
        'night_shift', 
        'Night Shift', 
        'Nachtschicht', 
        'Quart de nuit', 
        'Turno nocturno', 
        TRUE
    );
    
    INSERT INTO TRANSLATIONS (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE)
    VALUES (
        '5', 
        'weekend_allowance', 
        'Weekend Allowance', 
        'Wochenendzulage', 
        'Allocation de week-end', 
        'Subsidio de fin de semana', 
        TRUE
    );
    
    INSERT INTO TRANSLATIONS (TRANSLATION_ID, SECTION_ID, EN, DE, FR, ES, ACTIVE)
    VALUES (
        '6', 
        'holiday_pay', 
        'Holiday Pay', 
        'Feiertagszuschlag', 
        'Prime de jour férié', 
        'Pago por días festivos', 
        FALSE
    );
END;
`;

// Start the server
app.listen(port, () => {
  console.log(`Translation management API server running at http://localhost:${port}`);
});

module.exports = app;
