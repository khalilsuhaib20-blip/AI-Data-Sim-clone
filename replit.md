# AI Data Company Simulator Portfolio

## Overview
Full-stack React + Express portfolio web app that simulates working at multiple data companies. Features AI-generated data engineering tasks via OpenAI, JWT admin auth, a Kanban task board, a dashboard with analytics, and a contact form.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **AI**: OpenAI via Replit AI Integrations
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack Query v5
- **DnD**: @hello-pangea/dnd (Board page, currently unused in main routes)

## Architecture

### Shared (`shared/`)
- `schema.ts` - Drizzle schema: users, companies, tasks, contactRequests
- `routes.ts` - API route definitions, Zod schemas, type exports

### Server (`server/`)
- `routes.ts` - All API endpoints with auth middleware
- `storage.ts` - Database CRUD via IStorage interface
- `auth.ts` - JWT generation/verification, bcrypt, middleware (requireAuth/requireAdmin), admin seeder
- `db.ts` - Drizzle database connection

### Client (`client/src/`)
- `App.tsx` - Routes + AuthProvider + Navbar
- `lib/auth.tsx` - AuthProvider context, useAuth hook, authFetch helper
- `hooks/use-tasks.ts` - Task queries/mutations with optimistic updates
- `hooks/use-companies.ts` - Company queries/mutations
- `components/layout/Navbar.tsx` - Responsive nav with public/admin mode switching

### Pages
- **Public**: Home, Companies, CompanyDetails, Tasks, TaskDetails, Dashboard, Contact, Login
- **Admin** (require JWT + admin role): AdminDashboard, ManageCompanies, ManageTasks, GenerateTask, ContactRequests

## Key Details
- Admin credentials: `admin / admin123` (seeded on first run)
- JWT secret: `SESSION_SECRET` env var
- OpenAI keys: `AI_INTEGRATIONS_OPENAI_API_KEY` + `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Design: Electric indigo primary, Bricolage Grotesque + DM Sans fonts
- CSS utilities: `glass-panel`, `card-hover`
- Run: `npm run dev` (Start application workflow)

## API Routes
- `POST /api/auth/login` - Login, returns JWT
- `GET /api/auth/me` - Get current user (auth required)
- `GET/POST /api/companies` - List/create companies
- `GET/PATCH/DELETE /api/companies/:id` - Get/update/delete company
- `GET/POST /api/tasks` - List/create tasks (supports ?companyId filter)
- `GET/PATCH/DELETE /api/tasks/:id` - Get/update/delete task
- `POST /api/generate-task` - AI task generation (admin)
- `GET/POST /api/contacts` - List (admin)/create contact requests
- `GET /api/dashboard/stats` - Dashboard analytics
