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

## Architecture

### Form Builder System
The core of the application is a modular form element system:

- **FormElements Registry** (`app/(dashboard)/_components/FormElements.tsx`): Central registry defining all available form field types and their interfaces
- **Form Field Components** (`components/fields/*.tsx`): Each field type (TextField, NumberField, SignatureField, etc.) implements the `FormElement` interface with:
  - `designerBtnElement`: Icon and label for the sidebar
  - `designerComponent`: Preview component in the form builder
  - `formComponent`: Actual form field for end users
  - `propertiesComponent`: Configuration panel for the field
  - `validate`: Validation logic

### State Management
- **Designer Store** (`store/store.ts`): Zustand store managing form builder state including:
  - `elements`: Array of form elements in the current form
  - `selectedElement`: Currently selected element for editing
  - CRUD operations for form elements

### Database Schema
- **Forms**: Stored with JSON `content` field containing the form structure
- **FormSubmissions**: Store user responses as JSON in `content` field
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

## Important Patterns

- **Server Actions**: Form operations in `app/actions/form.ts` using Next.js server actions
- **Type Safety**: Strict TypeScript with Zod schemas for validation
- **Component Composition**: Form elements implement consistent interfaces for maximum flexibility
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Database Considerations

- SQLite for simplicity in development
- Form content stored as JSON for flexibility
- Prisma handles migrations and type generation
- Run `npx prisma generate` after schema changes