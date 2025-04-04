
# SAP HANA Translation Management System

A React-based frontend for managing translations in SAP HANA applications. This application provides a user interface for creating, editing, and managing translations across different modules and sections.

## Features

- **Module Management**: Create, edit, and delete modules
- **Section Management**: Organize translations in logical sections within modules
- **Translation Management**: Create, edit, delete, and toggle active status for translations
- **Multi-language Support**: Manage translations for English, German, French, and Spanish
- **Import/Export**: Upload translations from Excel or JSON files

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to http://localhost:5173

## Backend Integration

This frontend is designed to work with a Node.js backend that connects to a SAP HANA database. By default, it uses mock data for development purposes.

To connect to the actual backend:

1. Start the backend server (see backend README)
2. Update the `API_BASE_URL` in `src/lib/api.ts` to point to your backend server address

## Structure

- `src/components` - Reusable React components
- `src/pages` - Page components for different routes
- `src/lib` - Utility functions and API client
- `src/backend` - Backend API server (Node.js with SAP HANA integration)

## Technologies

- **React**: UI library
- **React Router**: Navigation and routing
- **shadcn/ui**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
