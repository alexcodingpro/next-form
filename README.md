# NextForm - A Simple And Powerful Form Builder With Drag & Drop Features 

This project is a simple and powerful form builder with drag & drop features. You can create your own form and share to your friends or clients. It's a open source project and you can contribute to this project. Build with Next.js, TailwindCSS, Shadcn/ui and Beautiful DnD.

## Features

- Drag & Drop Form Builder
- Share Form With Your Friends Or Clients
- Beautiful Landing Page With TailwindCSS
- Dashboard to manage your forms
- Form Submission
- Collect Form Data
- Authentication with Google and GitHub

## Screenshots

| Screenshot | Description |
| --- | --- |
| ![Landing Page](https://i.ibb.co/QNZGX9L/next-form-landingpage.png) | Landing Page |
| ![Dashboard](https://i.ibb.co/SsTNxyH/next-form-dashboard.png) | Dashboard |
| ![DetailsForms](https://i.ibb.co/Hn0Lcbf/next-form-detail-form.png) | Details Forms |
| ![Form Submission](https://i.ibb.co/h2JgdvJ/next-form-form-submission.png) | Form Submission |
| ![Form Builder](https://i.ibb.co/mq06Npn/next-form-builder.png) | Form Builder |

## Demo Link

[https://next-form-kappa.vercel.app/](https://next-form-kappa.vercel.app/)

## Tech Stack

- Next.js - React Framework
- TypeScript - Programming Language
- TailwindCSS - CSS Framework
- Shadcn/ui - UI Components
- Beautiful DnD - Drag & Drop Library
- Prisma - ORM
- SQLite - Database
- Zustand - State Management
- NextAuth.js - Authentication Service

## Getting Started

First, run the development server:

```bash
npm i # install dependencies

npm run dev # run development server

npm run build # build production

npm run start # run production server
```

setup .env file and add your own credentials example:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## Database Setup

After setting up your environment variables, run the following commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```