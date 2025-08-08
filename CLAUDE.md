# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextForm is a drag-and-drop form builder built with Next.js 14, TypeScript, and modern web technologies. It allows users to create, share, and collect responses from custom forms with a visual interface.

**Key Technologies:**
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM with SQLite
- NextAuth.js v5 (beta) for authentication
- Zustand for state management
- @dnd-kit/core for drag-and-drop functionality
- Radix UI + shadcn/ui components
- TailwindCSS + tailwindcss-animate
- jsPDF + html2canvas for PDF generation

## Architecture

### Form Builder System
The core of the application is a modular form element system:

- **FormElements Registry** (`app/(dashboard)/_components/FormElements.tsx`): Central registry defining all available form field types and their interfaces
- **Form Field Components** (`components/fields/*.tsx`): Each field type implements the `FormElement` interface with:
  - `designerBtnElement`: Icon and label for the sidebar
  - `designerComponent`: Preview component in the form builder
  - `formComponent`: Actual form field for end users
  - `propertiesComponent`: Configuration panel for the field
  - `validate`: Validation logic

#### Available Field Types:

**Layout Elements:**
- `TitleField`: Form titles and headings
- `SubTitleField`: Secondary headings
- `ParagraphField`: Static text content
- `SeperatorField`: Visual dividers
- `SpacerField`: Empty spacing

**Form Elements:**
- `TextField`: Single-line text input
- `NumberField`: Numeric input with validation
- `TextAreaField`: Multi-line text input
- `TextParagraphField`: **NEW** - Pre-written text with variable replacement using `{{variable}}` syntax
- `DateField`: Date picker
- `SelectField`: Dropdown selection
- `CheckboxField`: Boolean checkbox
- `SignatureField`: Canvas-based signature capture with pen/type modes

### State Management
- **Designer Store** (`store/store.ts`): Zustand store managing form builder state including:
  - `elements`: Array of form elements in the current form
  - `selectedElement`: Currently selected element for editing
  - CRUD operations for form elements

### Database Schema
- **Forms**: Stored with JSON `content` field containing the form structure
- **FormSubmissions**: Store user responses as JSON in `content` field
  - Text fields: Direct string values
  - Signature fields: Base64 image data
  - TextParagraph fields: JSON object with variable key-value pairs
- **Authentication**: NextAuth.js with Google, GitHub OAuth, and email/password

### Route Structure
- `(landingpage)`: Public marketing pages
- `(auth)`: Sign-in/sign-up pages
- `(dashboard)`: Protected dashboard and form management
  - `dashboard`: Main dashboard with form statistics
  - `builder/[id]`: Form builder interface
  - `forms/[id]`: Form details and submissions view
- `(submission)/submit/[formUrl]`: Public form submission pages

## Development Commands

```bash
# Install dependencies
npm i

# Development server
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting
npm run lint

# Database operations
npx prisma generate          # Generate Prisma client
npx prisma migrate dev       # Run migrations
npx prisma studio           # Open database GUI
npx prisma db push          # Push schema changes (for development)
```

## Environment Setup

Required environment variables:
```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## Adding New Form Field Types

To add a new form field:

1. Create field component in `components/fields/NewField.tsx` implementing the `FormElement` interface
2. Add the field type to `ElementsType` union in `FormElements.tsx`
3. Import and register in the `FormElements` object
4. Add to the sidebar in `FormElementsSidebar.tsx`
5. Add handling in submissions view (`forms/[id]/page.tsx`) if special display logic is needed
6. Add PDF generation support in `lib/pdf-generator.ts` for the new field type

### TextParagraph Field Implementation
The TextParagraph field uses a variable replacement system:
- **Syntax**: `{{variable_name}}` in paragraph text
- **Storage**: Variables stored as JSON: `{"name": "John", "date": "2024-01-01"}`
- **Validation**: Required fields check that all variables are filled
- **Display**: Shows variable names and values in submissions table
- **PDF**: Generates full paragraph with variables replaced

## Key Implementation Details

### Form Data Flow
1. **Builder**: Form structure stored as JSON array of `FormElementInstance` objects
2. **Submission**: User responses collected and stored as JSON key-value pairs
3. **Display**: Submissions displayed in table format with type-specific rendering

### Authentication Flow
- NextAuth.js v5 configuration in `auth.ts`
- Supports OAuth (Google, GitHub) and credentials (email/password)
- Middleware protection for dashboard routes

### Drag-and-Drop Implementation
- Uses @dnd-kit/core for accessible drag-and-drop
- `DragOverlayWrapper` handles drag previews
- Form elements can be dragged from sidebar to designer area

### Styling Approach
- TailwindCSS with custom design tokens
- shadcn/ui component library for consistent UI
- Dark/light theme support via next-themes

### PDF Generation System
- **Library**: jsPDF with html2canvas for rendering
- **Location**: `lib/pdf-generator.ts` contains all PDF logic
- **Features**: 
  - A4 format with proper margins and typography
  - Signature image embedding
  - Text paragraph variable replacement
  - Professional document styling
  - Automatic file naming with form name and date
- **Usage**: PDF download button in submissions table Actions column

## Important Patterns

- **Server Actions**: Form operations in `app/actions/form.ts` using Next.js server actions
- **Type Safety**: Strict TypeScript with Zod schemas for validation
- **Component Composition**: Form elements implement consistent interfaces for maximum flexibility
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Auto-save**: Form builder includes auto-save functionality with visual feedback
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **State Synchronization**: Database-first approach for operations to prevent data loss

## Database Considerations

- SQLite for simplicity in development
- Form content stored as JSON for flexibility
- Prisma handles migrations and type generation
- Run `npx prisma generate` after schema changes

## Recent Features Added

### Form Builder Improvements (Latest)
- **Auto-save functionality**: Saves every 30 seconds with visual feedback
- **Better error handling**: Database-first operations prevent data loss
- **Loading states**: Visual feedback during save/delete operations
- **Enhanced save button**: Shows unsaved changes with asterisk

### PDF Generation System
- **One-click PDF export**: Generate professional A4 PDFs of form submissions
- **Signature embedding**: Digital signatures included as images
- **Variable replacement**: TextParagraph fields render with filled variables
- **Professional formatting**: Proper margins, typography, and layout

### Text Paragraph Field
- **Variable system**: Use `{{variable}}` syntax for dynamic content
- **Real-time preview**: Users see text update as they fill variables
- **Professional templates**: Perfect for contracts, letters, agreements
- **JSON storage**: Variables stored as key-value pairs for flexibility

## Common Issues & Solutions

### Build/Development Issues
- **Radix UI module errors**: Clear `.next` and `node_modules`, reinstall dependencies
- **PDF generation errors**: Ensure jsPDF and html2canvas are properly installed
- **TypeScript errors**: Run `npx prisma generate` after schema changes

### Form Builder Issues
- **Save not persisting**: Auto-save now prevents this with database-first operations
- **Fields disappearing on delete**: Fixed with proper async/await and error handling
- **UI overlap**: Form elements properly sized for 120px designer containers