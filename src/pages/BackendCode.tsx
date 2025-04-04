
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeFile {
  name: string;
  path: string;
  content: string;
}

const BackendCode = () => {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('server.js');

  useEffect(() => {
    // In a real application, this would fetch from an API
    const backendFiles: CodeFile[] = [
      {
        name: 'server.js',
        path: '/server.js',
        content: getServerJsContent()
      },
      {
        name: 'db.js',
        path: '/db.js',
        content: getDbJsContent()
      },
      {
        name: 'translationRoutes.js',
        path: '/routes/translationRoutes.js',
        content: getTranslationRoutesContent()
      },
      {
        name: 'moduleRoutes.js',
        path: '/routes/moduleRoutes.js',
        content: getModuleRoutesContent()
      },
      {
        name: 'sectionRoutes.js',
        path: '/routes/sectionRoutes.js',
        content: getSectionRoutesContent()
      },
      {
        name: 'languageRoutes.js',
        path: '/routes/languageRoutes.js',
        content: getLanguageRoutesContent()
      }
    ];
    
    setFiles(backendFiles);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Backend Code</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Select a file to view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.path}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedFile === file.name
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedFile(file.name)}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>{selectedFile}</CardTitle>
            <CardDescription>
              Backend code implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full rounded-md border p-4">
              <pre className="text-sm font-mono">
                {files.find(f => f.name === selectedFile)?.content || 'Select a file to view its content'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Backend code content functions
function getServerJsContent() {
  return `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const translationRoutes = require('./routes/translationRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const languageRoutes = require('./routes/languageRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/translations', translationRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/languages', languageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`;
}

function getDbJsContent() {
  return `const hana = require('@sap/hana-client');

// Connection configuration
const connectionConfig = {
  serverNode: process.env.HANA_HOST || 'localhost:30015',
  uid: process.env.HANA_USER || 'SYSTEM',
  pwd: process.env.HANA_PASSWORD || 'Password1',
  encrypt: true, // Set to true for encrypted connection
  sslValidateCertificate: false // Disable SSL certificate validation for dev
};

// Create a connection pool
const pool = hana.createPool({
  ...connectionConfig,
  maxConnections: 10, // Maximum number of connections in the pool
  idleTimeout: 30000 // Connection idle timeout in milliseconds
});

/**
 * Execute a SQL query with parameters
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} - Query results
 */
async function executeQuery(sql, params = []) {
  let connection;
  try {
    connection = await pool.acquire();
    
    return new Promise((resolve, reject) => {
      connection.exec(sql, params, (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    if (connection) {
      await pool.release(connection);
    }
  }
}

module.exports = {
  executeQuery
};`;
}

function getTranslationRoutesContent() {
  return `const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const xlsx = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Get all translations or filtered by module
 */
router.get('/', async (req, res, next) => {
  try {
    let sql = \`
      SELECT t.id, t.module_id, m.name as module, t.section_id, s.name as section,
             t.translation_key, t.active,
             JSON_OBJECT('translations', 
               (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT('lang', l.code, 'value', tl.value)
               )
               FROM translation_languages tl
               JOIN languages l ON tl.language_id = l.id
               WHERE tl.translation_id = t.id)
             ) as translations
      FROM translations t
      JOIN modules m ON t.module_id = m.id
      JOIN sections s ON t.section_id = s.id
    \`;
    
    const params = [];
    
    if (req.query.module) {
      sql += ' WHERE t.module_id = ?';
      params.push(req.query.module);
    }
    
    sql += ' ORDER BY t.translation_key';
    
    const translations = await db.executeQuery(sql, params);
    
    // Transform the results to match the expected format
    const formattedTranslations = translations.map(t => {
      const translationsObj = JSON.parse(t.translations);
      const result = {
        id: t.id,
        module: t.module,
        module_id: t.module_id,
        section: t.section,
        section_id: t.section_id,
        translation_key: t.translation_key,
        active: t.active === 1
      };
      
      // Add language values
      if (translationsObj && translationsObj.translations) {
        translationsObj.translations.forEach(trans => {
          result[trans.lang] = trans.value;
        });
      }
      
      return result;
    });
    
    res.json(formattedTranslations);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific translation by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sql = \`
      SELECT t.id, t.module_id, m.name as module, t.section_id, s.name as section,
             t.translation_key, t.active,
             JSON_OBJECT('translations', 
               (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT('lang', l.code, 'value', tl.value)
               )
               FROM translation_languages tl
               JOIN languages l ON tl.language_id = l.id
               WHERE tl.translation_id = t.id)
             ) as translations
      FROM translations t
      JOIN modules m ON t.module_id = m.id
      JOIN sections s ON t.section_id = s.id
      WHERE t.id = ?
    \`;
    
    const translations = await db.executeQuery(sql, [req.params.id]);
    
    if (translations.length === 0) {
      return res.status(404).json({ message: 'Translation not found' });
    }
    
    // Transform the results to match the expected format
    const t = translations[0];
    const translationsObj = JSON.parse(t.translations);
    const result = {
      id: t.id,
      module: t.module,
      module_id: t.module_id,
      section: t.section,
      section_id: t.section_id,
      translation_key: t.translation_key,
      active: t.active === 1
    };
    
    // Add language values
    if (translationsObj && translationsObj.translations) {
      translationsObj.translations.forEach(trans => {
        result[trans.lang] = trans.value;
      });
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Add a new translation
 */
router.post('/', async (req, res, next) => {
  try {
    const { module_id, section_id, translation_key, active = true, ...languageValues } = req.body;
    
    // Validation
    if (!module_id || !section_id || !translation_key) {
      return res.status(400).json({ message: 'Module ID, section ID, and translation key are required' });
    }
    
    // Check if translation key already exists for this module/section
    const checkSql = 'SELECT id FROM translations WHERE module_id = ? AND section_id = ? AND translation_key = ?';
    const existing = await db.executeQuery(checkSql, [module_id, section_id, translation_key]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Translation key already exists for this module/section' });
    }
    
    // Get available languages
    const langSql = 'SELECT id, code FROM languages WHERE active = 1';
    const languages = await db.executeQuery(langSql);
    
    // Insert translation
    const translationId = uuidv4();
    const insertSql = 'INSERT INTO translations (id, module_id, section_id, translation_key, active) VALUES (?, ?, ?, ?, ?)';
    await db.executeQuery(insertSql, [translationId, module_id, section_id, translation_key, active ? 1 : 0]);
    
    // Insert translation languages
    const languageInserts = [];
    languages.forEach(lang => {
      if (languageValues[lang.code]) {
        languageInserts.push([uuidv4(), translationId, lang.id, languageValues[lang.code]]);
      }
    });
    
    if (languageInserts.length > 0) {
      const langValuesSql = 'INSERT INTO translation_languages (id, translation_id, language_id, value) VALUES ';
      const placeholders = languageInserts.map(() => '(?, ?, ?, ?)').join(', ');
      const flatValues = languageInserts.flat();
      
      await db.executeQuery(langValuesSql + placeholders, flatValues);
    }
    
    res.status(201).json({
      id: translationId,
      module_id,
      section_id,
      translation_key,
      active,
      ...languageValues
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update a translation
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { module_id, section_id, translation_key, active, ...languageValues } = req.body;
    
    // Check if translation exists
    const checkSql = 'SELECT id FROM translations WHERE id = ?';
    const existing = await db.executeQuery(checkSql, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Translation not found' });
    }
    
    // Update translation
    let updateSql = 'UPDATE translations SET ';
    const updateParams = [];
    
    if (module_id) {
      updateSql += 'module_id = ?, ';
      updateParams.push(module_id);
    }
    
    if (section_id) {
      updateSql += 'section_id = ?, ';
      updateParams.push(section_id);
    }
    
    if (translation_key) {
      updateSql += 'translation_key = ?, ';
      updateParams.push(translation_key);
    }
    
    if (active !== undefined) {
      updateSql += 'active = ?, ';
      updateParams.push(active ? 1 : 0);
    }
    
    // Remove trailing comma and space
    updateSql = updateSql.slice(0, -2);
    
    if (updateParams.length > 0) {
      updateSql += ' WHERE id = ?';
      updateParams.push(id);
      
      await db.executeQuery(updateSql, updateParams);
    }
    
    // Update language values
    if (Object.keys(languageValues).length > 0) {
      // Get language IDs by code
      const langCodes = Object.keys(languageValues);
      const placeholders = langCodes.map(() => '?').join(', ');
      const langSql = \`SELECT id, code FROM languages WHERE code IN (\${placeholders}) AND active = 1\`;
      const languages = await db.executeQuery(langSql, langCodes);
      
      // Create a map of language code to ID
      const langMap = languages.reduce((map, lang) => {
        map[lang.code] = lang.id;
        return map;
      }, {});
      
      // Update or insert language values
      for (const [code, value] of Object.entries(languageValues)) {
        const langId = langMap[code];
        
        if (langId) {
          // Check if translation language entry exists
          const checkLangSql = 'SELECT id FROM translation_languages WHERE translation_id = ? AND language_id = ?';
          const existingLang = await db.executeQuery(checkLangSql, [id, langId]);
          
          if (existingLang.length > 0) {
            // Update existing entry
            const updateLangSql = 'UPDATE translation_languages SET value = ? WHERE translation_id = ? AND language_id = ?';
            await db.executeQuery(updateLangSql, [value, id, langId]);
          } else {
            // Insert new entry
            const insertLangSql = 'INSERT INTO translation_languages (id, translation_id, language_id, value) VALUES (?, ?, ?, ?)';
            await db.executeQuery(insertLangSql, [uuidv4(), id, langId, value]);
          }
        }
      }
    }
    
    res.json({ 
      id, 
      message: 'Translation updated successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update translation status (active/inactive)
 */
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status is required' });
    }
    
    const updateSql = 'UPDATE translations SET active = ? WHERE id = ?';
    const result = await db.executeQuery(updateSql, [active ? 1 : 0, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Translation not found' });
    }
    
    res.json({ 
      success: true, 
      message: \`Translation \${active ? 'activated' : 'deactivated'} successfully\` 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a translation
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete language values first (foreign key constraint)
    const deleteLanguagesSql = 'DELETE FROM translation_languages WHERE translation_id = ?';
    await db.executeQuery(deleteLanguagesSql, [id]);
    
    // Delete translation
    const deleteTranslationSql = 'DELETE FROM translations WHERE id = ?';
    const result = await db.executeQuery(deleteTranslationSql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Translation not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Translation deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Upload translations from Excel file
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Read Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }
    
    // Validate required columns
    const requiredColumns = ['module_id', 'section_id', 'translation_key'];
    const firstRow = data[0];
    
    for (const col of requiredColumns) {
      if (!firstRow.hasOwnProperty(col)) {
        return res.status(400).json({ message: \`Missing required column: \${col}\` });
      }
    }
    
    // Get available languages
    const langSql = 'SELECT id, code FROM languages WHERE active = 1';
    const languages = await db.executeQuery(langSql);
    const langMap = languages.reduce((map, lang) => {
      map[lang.code] = lang.id;
      return map;
    }, {});
    
    // Process each row
    const results = {
      added: 0,
      updated: 0,
      errors: []
    };
    
    for (const row of data) {
      try {
        const { module_id, section_id, translation_key, active = true, ...languageValues } = row;
        
        // Check if translation exists
        const checkSql = 'SELECT id FROM translations WHERE module_id = ? AND section_id = ? AND translation_key = ?';
        const existing = await db.executeQuery(checkSql, [module_id, section_id, translation_key]);
        
        if (existing.length > 0) {
          // Update existing translation
          const id = existing[0].id;
          const updateSql = 'UPDATE translations SET active = ? WHERE id = ?';
          await db.executeQuery(updateSql, [active ? 1 : 0, id]);
          
          // Update language values
          for (const [code, value] of Object.entries(languageValues)) {
            const langId = langMap[code];
            
            if (langId) {
              const checkLangSql = 'SELECT id FROM translation_languages WHERE translation_id = ? AND language_id = ?';
              const existingLang = await db.executeQuery(checkLangSql, [id, langId]);
              
              if (existingLang.length > 0) {
                const updateLangSql = 'UPDATE translation_languages SET value = ? WHERE translation_id = ? AND language_id = ?';
                await db.executeQuery(updateLangSql, [value, id, langId]);
              } else {
                const insertLangSql = 'INSERT INTO translation_languages (id, translation_id, language_id, value) VALUES (?, ?, ?, ?)';
                await db.executeQuery(insertLangSql, [uuidv4(), id, langId, value]);
              }
            }
          }
          
          results.updated++;
        } else {
          // Insert new translation
          const translationId = uuidv4();
          const insertSql = 'INSERT INTO translations (id, module_id, section_id, translation_key, active) VALUES (?, ?, ?, ?, ?)';
          await db.executeQuery(insertSql, [translationId, module_id, section_id, translation_key, active ? 1 : 0]);
          
          // Insert language values
          for (const [code, value] of Object.entries(languageValues)) {
            const langId = langMap[code];
            
            if (langId) {
              const insertLangSql = 'INSERT INTO translation_languages (id, translation_id, language_id, value) VALUES (?, ?, ?, ?)';
              await db.executeQuery(insertLangSql, [uuidv4(), translationId, langId, value]);
            }
          }
          
          results.added++;
        }
      } catch (error) {
        results.errors.push({
          row: row.translation_key,
          error: error.message
        });
      }
    }
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;`;
}

function getModuleRoutesContent() {
  return `const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all modules
 */
router.get('/', async (req, res, next) => {
  try {
    const sql = \`
      SELECT id, name, description, active
      FROM modules
      ORDER BY name
    \`;
    
    const modules = await db.executeQuery(sql);
    
    // Transform the results to match the expected format
    const formattedModules = modules.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      active: m.active === 1
    }));
    
    res.json(formattedModules);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific module by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sql = \`
      SELECT id, name, description, active
      FROM modules
      WHERE id = ?
    \`;
    
    const modules = await db.executeQuery(sql, [req.params.id]);
    
    if (modules.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const module = modules[0];
    
    res.json({
      id: module.id,
      name: module.name,
      description: module.description,
      active: module.active === 1
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Add a new module
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, description = '', active = true } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Module name is required' });
    }
    
    // Check if module name already exists
    const checkSql = 'SELECT id FROM modules WHERE name = ?';
    const existing = await db.executeQuery(checkSql, [name]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Module name already exists' });
    }
    
    // Insert module
    const moduleId = uuidv4();
    const insertSql = 'INSERT INTO modules (id, name, description, active) VALUES (?, ?, ?, ?)';
    await db.executeQuery(insertSql, [moduleId, name, description, active ? 1 : 0]);
    
    res.status(201).json({
      id: moduleId,
      name,
      description,
      active
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update a module
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    
    // Check if module exists
    const checkSql = 'SELECT id FROM modules WHERE id = ?';
    const existing = await db.executeQuery(checkSql, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Build update query
    let updateSql = 'UPDATE modules SET ';
    const updateParams = [];
    
    if (name !== undefined) {
      // Check if the new name already exists for another module
      if (name) {
        const checkNameSql = 'SELECT id FROM modules WHERE name = ? AND id != ?';
        const existingName = await db.executeQuery(checkNameSql, [name, id]);
        
        if (existingName.length > 0) {
          return res.status(409).json({ message: 'Module name already exists' });
        }
        
        updateSql += 'name = ?, ';
        updateParams.push(name);
      } else {
        return res.status(400).json({ message: 'Module name cannot be empty' });
      }
    }
    
    if (description !== undefined) {
      updateSql += 'description = ?, ';
      updateParams.push(description);
    }
    
    if (active !== undefined) {
      updateSql += 'active = ?, ';
      updateParams.push(active ? 1 : 0);
    }
    
    // If no fields to update
    if (updateParams.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Remove trailing comma and space
    updateSql = updateSql.slice(0, -2);
    
    updateSql += ' WHERE id = ?';
    updateParams.push(id);
    
    await db.executeQuery(updateSql, updateParams);
    
    res.json({ 
      id, 
      message: 'Module updated successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update module status (active/inactive)
 */
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status is required' });
    }
    
    const updateSql = 'UPDATE modules SET active = ? WHERE id = ?';
    const result = await db.executeQuery(updateSql, [active ? 1 : 0, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json({ 
      success: true, 
      message: \`Module \${active ? 'activated' : 'deactivated'} successfully\` 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a module
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if module has any sections
    const checkSectionsSql = 'SELECT COUNT(*) as count FROM sections WHERE module_id = ?';
    const sectionsCount = await db.executeQuery(checkSectionsSql, [id]);
    
    if (sectionsCount[0].count > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete module with existing sections. Delete the sections first.' 
      });
    }
    
    // Check if module has any translations
    const checkTranslationsSql = 'SELECT COUNT(*) as count FROM translations WHERE module_id = ?';
    const translationsCount = await db.executeQuery(checkTranslationsSql, [id]);
    
    if (translationsCount[0].count > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete module with existing translations. Delete the translations first.' 
      });
    }
    
    // Delete module
    const deleteModuleSql = 'DELETE FROM modules WHERE id = ?';
    const result = await db.executeQuery(deleteModuleSql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Module deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;`;
}

function getSectionRoutesContent() {
  return `const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all sections
 */
router.get('/', async (req, res, next) => {
  try {
    let sql = \`
      SELECT s.id, s.name, s.description, s.active, 
             s.module_id, m.name as module_name
      FROM sections s
      JOIN modules m ON s.module_id = m.id
    \`;
    
    const params = [];
    
    // Filter by module if provided
    if (req.query.module) {
      sql += ' WHERE s.module_id = ?';
      params.push(req.query.module);
    }
    
    sql += ' ORDER BY s.name';
    
    const sections = await db.executeQuery(sql, params);
    
    // Transform the results to match the expected format
    const formattedSections = sections.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      module: s.module_id,
      module_name: s.module_name,
      active: s.active === 1
    }));
    
    res.json(formattedSections);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific section by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sql = \`
      SELECT s.id, s.name, s.description, s.active, 
             s.module_id, m.name as module_name
      FROM sections s
      JOIN modules m ON s.module_id = m.id
      WHERE s.id = ?
    \`;
    
    const sections = await db.executeQuery(sql, [req.params.id]);
    
    if (sections.length === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    const section = sections[0];
    
    res.json({
      id: section.id,
      name: section.name,
      description: section.description,
      module: section.module_id,
      module_name: section.module_name,
      active: section.active === 1
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Add a new section
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, description = '', module, active = true } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Section name is required' });
    }
    
    if (!module) {
      return res.status(400).json({ message: 'Module ID is required' });
    }
    
    // Check if module exists
    const checkModuleSql = 'SELECT id FROM modules WHERE id = ?';
    const existingModule = await db.executeQuery(checkModuleSql, [module]);
    
    if (existingModule.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Check if section name already exists for this module
    const checkSql = 'SELECT id FROM sections WHERE name = ? AND module_id = ?';
    const existing = await db.executeQuery(checkSql, [name, module]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Section name already exists for this module' });
    }
    
    // Insert section
    const sectionId = uuidv4();
    const insertSql = 'INSERT INTO sections (id, name, description, module_id, active) VALUES (?, ?, ?, ?, ?)';
    await db.executeQuery(insertSql, [sectionId, name, description, module, active ? 1 : 0]);
    
    res.status(201).json({
      id: sectionId,
      name,
      description,
      module,
      active
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update a section
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, module, active } = req.body;
    
    // Check if section exists
    const checkSql = 'SELECT id, module_id FROM sections WHERE id = ?';
    const existing = await db.executeQuery(checkSql, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    const currentModuleId = existing[0].module_id;
    
    // Check if module exists if being updated
    if (module && module !== currentModuleId) {
      const checkModuleSql = 'SELECT id FROM modules WHERE id = ?';
      const existingModule = await db.executeQuery(checkModuleSql, [module]);
      
      if (existingModule.length === 0) {
        return res.status(404).json({ message: 'Module not found' });
      }
    }
    
    // Check if the new name already exists for another section in the same module
    if (name) {
      const moduleToCheck = module || currentModuleId;
      const checkNameSql = 'SELECT id FROM sections WHERE name = ? AND module_id = ? AND id != ?';
      const existingName = await db.executeQuery(checkNameSql, [name, moduleToCheck, id]);
      
      if (existingName.length > 0) {
        return res.status(409).json({ message: 'Section name already exists for this module' });
      }
    }
    
    // Build update query
    let updateSql = 'UPDATE sections SET ';
    const updateParams = [];
    
    if (name !== undefined) {
      if (name) {
        updateSql += 'name = ?, ';
        updateParams.push(name);
      } else {
        return res.status(400).json({ message: 'Section name cannot be empty' });
      }
    }
    
    if (description !== undefined) {
      updateSql += 'description = ?, ';
      updateParams.push(description);
    }
    
    if (module !== undefined) {
      updateSql += 'module_id = ?, ';
      updateParams.push(module);
    }
    
    if (active !== undefined) {
      updateSql += 'active = ?, ';
      updateParams.push(active ? 1 : 0);
    }
    
    // If no fields to update
    if (updateParams.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Remove trailing comma and space
    updateSql = updateSql.slice(0, -2);
    
    updateSql += ' WHERE id = ?';
    updateParams.push(id);
    
    await db.executeQuery(updateSql, updateParams);
    
    res.json({ 
      id, 
      message: 'Section updated successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update section status (active/inactive)
 */
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status is required' });
    }
    
    const updateSql = 'UPDATE sections SET active = ? WHERE id = ?';
    const result = await db.executeQuery(updateSql, [active ? 1 : 0, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json({ 
      success: true, 
      message: \`Section \${active ? 'activated' : 'deactivated'} successfully\` 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a section
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if section has any translations
    const checkTranslationsSql = 'SELECT COUNT(*) as count FROM translations WHERE section_id = ?';
    const translationsCount = await db.executeQuery(checkTranslationsSql, [id]);
    
    if (translationsCount[0].count > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete section with existing translations. Delete the translations first.' 
      });
    }
    
    // Delete section
    const deleteSectionSql = 'DELETE FROM sections WHERE id = ?';
    const result = await db.executeQuery(deleteSectionSql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Section deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;`;
}

function getLanguageRoutesContent() {
  return `const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all languages
 */
router.get('/', async (req, res, next) => {
  try {
    const sql = \`
      SELECT id, code, name, active, is_default
      FROM languages
      ORDER BY name
    \`;
    
    const languages = await db.executeQuery(sql);
    
    // Transform the results to match the expected format
    const formattedLanguages = languages.map(l => ({
      id: l.id,
      code: l.code,
      name: l.name,
      active: l.active === 1,
      is_default: l.is_default === 1
    }));
    
    res.json(formattedLanguages);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific language by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sql = \`
      SELECT id, code, name, active, is_default
      FROM languages
      WHERE id = ?
    \`;
    
    const languages = await db.executeQuery(sql, [req.params.id]);
    
    if (languages.length === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    const language = languages[0];
    
    res.json({
      id: language.id,
      code: language.code,
      name: language.name,
      active: language.active === 1,
      is_default: language.is_default === 1
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Add a new language
 */
router.post('/', async (req, res, next) => {
  try {
    const { code, name, active = true, is_default = false } = req.body;
    
    // Validation
    if (!code) {
      return res.status(400).json({ message: 'Language code is required' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'Language name is required' });
    }
    
    // Check if language code already exists
    const checkSql = 'SELECT id FROM languages WHERE code = ?';
    const existing = await db.executeQuery(checkSql, [code]);
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Language code already exists' });
    }
    
    // If setting as default, update existing default language
    if (is_default) {
      const updateDefaultSql = 'UPDATE languages SET is_default = 0 WHERE is_default = 1';
      await db.executeQuery(updateDefaultSql);
    }
    
    // Insert language
    const languageId = uuidv4();
    const insertSql = 'INSERT INTO languages (id, code, name, active, is_default) VALUES (?, ?, ?, ?, ?)';
    await db.executeQuery(insertSql, [languageId, code, name, active ? 1 : 0, is_default ? 1 : 0]);
    
    res.status(201).json({
      id: languageId,
      code,
      name,
      active,
      is_default
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update a language
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, active, is_default } = req.body;
    
    // Check if language exists
    const checkSql = 'SELECT id, is_default FROM languages WHERE id = ?';
    const existing = await db.executeQuery(checkSql, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    // Check if the new code already exists for another language
    if (code) {
      const checkCodeSql = 'SELECT id FROM languages WHERE code = ? AND id != ?';
      const existingCode = await db.executeQuery(checkCodeSql, [code, id]);
      
      if (existingCode.length > 0) {
        return res.status(409).json({ message: 'Language code already exists' });
      }
    }
    
    // If setting as default, update existing default language
    if (is_default === true && existing[0].is_default !== 1) {
      const updateDefaultSql = 'UPDATE languages SET is_default = 0 WHERE is_default = 1';
      await db.executeQuery(updateDefaultSql);
    }
    
    // Build update query
    let updateSql = 'UPDATE languages SET ';
    const updateParams = [];
    
    if (code !== undefined) {
      if (code) {
        updateSql += 'code = ?, ';
        updateParams.push(code);
      } else {
        return res.status(400).json({ message: 'Language code cannot be empty' });
      }
    }
    
    if (name !== undefined) {
      if (name) {
        updateSql += 'name = ?, ';
        updateParams.push(name);
      } else {
        return res.status(400).json({ message: 'Language name cannot be empty' });
      }
    }
    
    if (active !== undefined) {
      // Don't allow deactivating default language
      if (active === false && existing[0].is_default === 1) {
        return res.status(400).json({ message: 'Cannot deactivate default language' });
      }
      
      updateSql += 'active = ?, ';
      updateParams.push(active ? 1 : 0);
    }
    
    if (is_default !== undefined) {
      updateSql += 'is_default = ?, ';
      updateParams.push(is_default ? 1 : 0);
      
      // If setting to default, ensure language is active
      if (is_default === true) {
        updateSql += 'active = 1, ';
      }
    }
    
    // If no fields to update
    if (updateParams.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    // Remove trailing comma and space
    updateSql = updateSql.slice(0, -2);
    
    updateSql += ' WHERE id = ?';
    updateParams.push(id);
    
    await db.executeQuery(updateSql, updateParams);
    
    res.json({ 
      id, 
      message: 'Language updated successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Set default language
 */
router.put('/:id/default', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if language exists and is active
    const checkSql = 'SELECT id, active FROM languages WHERE id = ?';
    const existing = await db.executeQuery(checkSql, [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    if (existing[0].active !== 1) {
      return res.status(400).json({ message: 'Cannot set inactive language as default' });
    }
    
    // Update all languages to not be default
    const resetDefaultSql = 'UPDATE languages SET is_default = 0';
    await db.executeQuery(resetDefaultSql);
    
    // Set the specified language as default
    const setDefaultSql = 'UPDATE languages SET is_default = 1 WHERE id = ?';
    await db.executeQuery(setDefaultSql, [id]);
    
    res.json({ 
      success: true, 
      message: 'Default language updated successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update language status (active/inactive)
 */
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status is required' });
    }
    
    // Check if language is default (can't deactivate default)
    if (!active) {
      const checkDefaultSql = 'SELECT is_default FROM languages WHERE id = ?';
      const defaultCheck = await db.executeQuery(checkDefaultSql, [id]);
      
      if (defaultCheck.length > 0 && defaultCheck[0].is_default === 1) {
        return res.status(400).json({ message: 'Cannot deactivate default language' });
      }
    }
    
    const updateSql = 'UPDATE languages SET active = ? WHERE id = ?';
    const result = await db.executeQuery(updateSql, [active ? 1 : 0, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    res.json({ 
      success: true, 
      message: \`Language \${active ? 'activated' : 'deactivated'} successfully\` 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a language
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if language is default
    const checkDefaultSql = 'SELECT is_default FROM languages WHERE id = ?';
    const defaultCheck = await db.executeQuery(checkDefaultSql, [id]);
    
    if (defaultCheck.length > 0 && defaultCheck[0].is_default === 1) {
      return res.status(400).json({ message: 'Cannot delete default language' });
    }
    
    // Check if language has any translations
    const checkTranslationsSql = \`
      SELECT COUNT(*) as count 
      FROM translation_languages 
      WHERE language_id = ?
    \`;
    const translationsCount = await db.executeQuery(checkTranslationsSql, [id]);
    
    if (translationsCount[0].count > 0) {
      return res.status(409).json({ 
        message: 'Cannot delete language with existing translations. Delete the translations first.' 
      });
    }
    
    // Delete language
    const deleteLanguageSql = 'DELETE FROM languages WHERE id = ?';
    const result = await db.executeQuery(deleteLanguageSql, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Language deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;`;
}

export default BackendCode;
