
# SAP HANA Translation Management API

This is the backend API for the SAP HANA Translation Management system. It provides endpoints for managing modules, sections, and translations.

## Prerequisites

- Node.js (v14 or higher)
- SAP HANA database (for production use)

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Setup environment variables (create a .env file):
   ```
   PORT=3001
   HANA_HOST=localhost:30015
   HANA_USER=YOUR_HANA_USERNAME
   HANA_PASSWORD=YOUR_HANA_PASSWORD
   ```

3. Create a directory for file uploads:
   ```
   mkdir uploads
   ```

## Running the API

For development:
```
npm run dev
```

For production:
```
npm start
```

## Database Setup

The `hanaSetupScript` variable in server.js contains the SQL statements to set up the required tables and stored procedures in your SAP HANA database. You can extract this script and run it against your database.

### Tables

1. **TRANSLATION_MODULES** - Stores module information
2. **TRANSLATION_SECTIONS** - Stores section information (linked to modules)
3. **TRANSLATIONS** - Stores actual translations (linked to sections)

## API Endpoints

### Modules

- `GET /api/modules` - Get all modules
- `POST /api/modules` - Create a new module
- `PUT /api/modules/:id` - Update a module
- `DELETE /api/modules/:id` - Delete a module

### Sections

- `GET /api/sections` - Get all sections (query param: ?module=module_id)
- `POST /api/sections` - Create a new section
- `PUT /api/sections/:id` - Update a section
- `DELETE /api/sections/:id` - Delete a section

### Translations

- `GET /api/translations` - Get all translations
- `GET /api/translations/:module` - Get translations for a specific module
- `POST /api/translations` - Add a new translation
- `POST /api/translations/:module` - Update translation for a specific language
- `DELETE /api/translations/:id` - Delete a translation
- `PUT /api/translations/:id/status` - Toggle translation active status
- `POST /api/translations/upload` - Upload translations from Excel or JSON file

## Development Mode

By default, the API uses mock data when there's no connection to a SAP HANA database. This allows for easy development and testing without requiring a database connection.

To switch to using the real database, uncomment the relevant sections in the code and provide proper SAP HANA connection details.
