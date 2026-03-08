# AI Data Company Simulator Portfolio

## Overview
Full-stack React + Express portfolio web app that simulates working at multiple data companies. Features AI-generated data engineering tasks via OpenAI, JWT admin auth, multi-view dashboard (Kanban/Timeline/Calendar), contact modal, and admin interface.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **AI**: OpenAI via Replit AI Integrations (configurable in admin Settings)
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack Query v5

## Architecture

### Shared (`shared/`)
- `schema.ts` - Drizzle schema: users, companies, tasks, contactRequests, appSettings
- `routes.ts` - API route definitions, Zod schemas, type exports

### Server (`server/`)
- `routes.ts` - All API endpoints with auth middleware, dynamic OpenAI config
- `storage.ts` - Database CRUD via IStorage interface (includes settings)
- `auth.ts` - JWT generation/verification, bcrypt, middleware (requireAuth/requireAdmin), admin seeder
- `db.ts` - Drizzle database connection

### Client (`client/src/`)
- `App.tsx` - Routes + AuthProvider + Navbar (public: / and /login; admin: /admin/*)
- `lib/auth.tsx` - AuthProvider context, useAuth hook
- `hooks/use-tasks.ts` - Task queries/mutations
- `hooks/use-companies.ts` - Company queries/mutations
- `components/layout/Navbar.tsx` - Minimal public nav, full admin nav
- `components/views/` - KanbanView, TimelineView, CalendarView, TaskCard
- `components/ContactModal.tsx` - Task detail + contact form modal

### Pages
- **Public**: PortfolioDashboard (/ - unified dashboard with Kanban/Timeline/Calendar views, filters, contact), Login
- **Admin** (require JWT + admin role): AdminDashboard, ManageCompanies, ManageTasks, GenerateTask, ContactRequests, Settings

## Key Details
- Admin credentials: `admin / admin123` (seeded on first run)
- JWT secret: `SESSION_SECRET` env var
- OpenAI: Uses built-in Replit AI integration by default; customizable via admin Settings page (API key, base URL, model)
- Admin login: Hidden from public navbar; access via `/login` directly
- Public site: Single-page dashboard at `/` with 3 views (Kanban, Timeline, Calendar), filters (company, topic), and Contact button per task
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
- `GET/PUT /api/settings` - Get/update app settings (admin)
- `DELETE /api/settings/:key` - Clear a setting (admin)
- `GET /api/dashboard/stats` - Dashboard analytics
