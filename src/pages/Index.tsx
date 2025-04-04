
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Translation Management System</h1>
        <p className="text-gray-600 mb-8">Connect to your SAP HANA backend to manage translations for different modules.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Offboarding Module</CardTitle>
              <CardDescription>Manage translations for the offboarding process</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">This module contains translations for employee offboarding workflows and related processes.</p>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Link to="/offboarding">
                <Button>Manage Translations</Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">View Details</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Offboarding Module</DialogTitle>
                    <DialogDescription>
                      Connect to your Node.js backend to fetch and manage translations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-500">This is a placeholder for the offboarding module translation interface.</p>
                    <p className="text-sm text-gray-500 mt-2">To connect to the actual backend, you'll need to implement API calls to your Node.js SAP HANA service.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shift Allowance Module</CardTitle>
              <CardDescription>Manage translations for shift allowances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">This module contains translations for shift allowance calculations and related terminology.</p>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Link to="/shift-allowance">
                <Button>Manage Translations</Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">View Details</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Shift Allowance Module</DialogTitle>
                    <DialogDescription>
                      Connect to your Node.js backend to fetch and manage translations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-500">This is a placeholder for the shift allowance module translation interface.</p>
                    <p className="text-sm text-gray-500 mt-2">To connect to the actual backend, you'll need to implement API calls to your Node.js SAP HANA service.</p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend Configuration</CardTitle>
              <CardDescription>Node.js + SAP HANA setup</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Configure the connection to your Node.js backend that interfaces with SAP HANA.</p>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">View Config</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Node.js Backend Setup</DialogTitle>
                    <DialogDescription>
                      How to set up your Node.js backend with SAP HANA
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-2">Backend Code Repository</h3>
                    <p className="text-sm text-gray-500 mb-4">Create a separate Node.js project for your backend with the following structure:</p>
                    
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-xs">
{`// server.js
const express = require('express');
const cors = require('cors');
const { getTranslationsByModule } = require('./hana-service');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/translations/:module', async (req, res) => {
  try {
    const module = req.params.module;
    const translations = await getTranslationsByModule(module);
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

app.post('/api/translations/:module', async (req, res) => {
  try {
    const module = req.params.module;
    const { key, language, value } = req.body;
    // Call your HANA procedure to update translations
    // ...
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating translations:', error);
    res.status(500).json({ error: 'Failed to update translations' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

// hana-service.js
const hana = require('@sap/hana-client');

const connectionParams = {
  serverNode: process.env.HANA_HOST,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
};

async function executeHanaQuery(query, params = []) {
  let connection;
  try {
    connection = hana.createConnection();
    await connection.connect(connectionParams);
    
    const statement = await connection.prepare(query);
    const result = await statement.execQuery(params);
    
    let rows = [];
    while (await result.next()) {
      rows.push(result.getValues());
    }
    
    await result.close();
    return rows;
  } catch (error) {
    console.error('HANA execution error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.disconnect();
    }
  }
}

async function getTranslationsByModule(module) {
  const query = \`CALL "YOUR_SCHEMA"."GET_TRANSLATIONS_BY_MODULE"(?, ?)\`;
  const result = await executeHanaQuery(query, [module, '']);
  return result;
}

async function updateTranslation(module, key, language, value) {
  const query = \`CALL "YOUR_SCHEMA"."UPDATE_TRANSLATION"(?, ?, ?, ?)\`;
  await executeHanaQuery(query, [module, key, language, value]);
  return true;
}

module.exports = {
  getTranslationsByModule,
  updateTranslation,
  executeHanaQuery
};`}
                      </pre>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-6 mb-2">SAP HANA Stored Procedures</h3>
                    <p className="text-sm text-gray-500 mb-4">Create these procedures in your SAP HANA database:</p>
                    
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                      <pre className="text-xs">
{`-- GET_TRANSLATIONS_BY_MODULE procedure
CREATE PROCEDURE "YOUR_SCHEMA"."GET_TRANSLATIONS_BY_MODULE" (
  IN i_module NVARCHAR(100),
  OUT o_translations TABLE (
    module NVARCHAR(100),
    translation_key NVARCHAR(255),
    en NVARCHAR(1000),
    de NVARCHAR(1000),
    fr NVARCHAR(1000),
    es NVARCHAR(1000)
  )
)
LANGUAGE SQLSCRIPT
AS
BEGIN
  o_translations = SELECT 
    module,
    translation_key,
    MAX(CASE WHEN language_code = 'en' THEN translation_text END) as en,
    MAX(CASE WHEN language_code = 'de' THEN translation_text END) as de,
    MAX(CASE WHEN language_code = 'fr' THEN translation_text END) as fr,
    MAX(CASE WHEN language_code = 'es' THEN translation_text END) as es
  FROM "YOUR_SCHEMA"."TRANSLATIONS"
  WHERE module = :i_module
  GROUP BY module, translation_key;
END;

-- UPDATE_TRANSLATION procedure
CREATE PROCEDURE "YOUR_SCHEMA"."UPDATE_TRANSLATION" (
  IN i_module NVARCHAR(100),
  IN i_key NVARCHAR(255),
  IN i_language NVARCHAR(10),
  IN i_value NVARCHAR(1000)
)
LANGUAGE SQLSCRIPT
AS
BEGIN
  MERGE INTO "YOUR_SCHEMA"."TRANSLATIONS" t
  USING (SELECT :i_module as module, :i_key as key, :i_language as lang, :i_value as val FROM DUMMY) s
  ON t.module = s.module AND t.translation_key = s.key AND t.language_code = s.lang
  WHEN MATCHED THEN
    UPDATE SET translation_text = s.val
  WHEN NOT MATCHED THEN
    INSERT (module, translation_key, language_code, translation_text)
    VALUES (s.module, s.key, s.lang, s.val);
END;`}
                      </pre>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-6 mb-2">Database Table Structure</h3>
                    <p className="text-sm text-gray-500 mb-4">Create this table in your SAP HANA database:</p>
                    
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto">
                      <pre className="text-xs">
{`CREATE TABLE "YOUR_SCHEMA"."TRANSLATIONS" (
  "ID" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "MODULE" NVARCHAR(100) NOT NULL,
  "TRANSLATION_KEY" NVARCHAR(255) NOT NULL,
  "LANGUAGE_CODE" NVARCHAR(10) NOT NULL,
  "TRANSLATION_TEXT" NVARCHAR(1000),
  UNIQUE ("MODULE", "TRANSLATION_KEY", "LANGUAGE_CODE")
);`}
                      </pre>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
