# AI Data Company Simulator Portfolio

## Overview
Full-stack React + Express portfolio web app that simulates working at multiple data companies. Features AI-generated data engineering tasks via OpenAI, JWT admin auth, project-based portfolio dashboard, AI task review, contact modal, and admin interface.

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
- `schema.ts` - Drizzle schema: users, companies (with githubLink), tasks, contactRequests, appSettings
- `routes.ts` - API route definitions, Zod schemas, type exports

### Server (`server/`)
- `routes.ts` - All API endpoints with auth middleware, dynamic OpenAI config, AI task review
- `storage.ts` - Database CRUD via IStorage interface (includes settings)
- `auth.ts` - JWT generation/verification, bcrypt, middleware (requireAuth/requireAdmin), admin seeder
- `db.ts` - Drizzle database connection

### Client (`client/src/`)
- `App.tsx` - Routes + AuthProvider + Navbar (public: / and /login; admin: /admin/*)
- `lib/auth.tsx` - AuthProvider context, useAuth hook
- `hooks/use-tasks.ts` - Task queries/mutations + useReviewTask for AI review
- `hooks/use-companies.ts` - Company queries/mutations
- `components/layout/Navbar.tsx` - Minimal public nav, full admin nav
- `components/views/` - TimelineView, TaskCard (KanbanView, CalendarView unused in current public layout)
- `components/ContactModal.tsx` - Task detail + contact form modal

### Pages
- **Public**: PortfolioDashboard (/ - project cards at top, timeline drill-down, completed work showcase, milestones/tools summary), Login
- **Admin** (require JWT + admin role): AdminDashboard, ManageCompanies (full CRUD + GitHub link), ManageTasks (full field editing + AI review), GenerateTask, ContactRequests, Settings

## Key Details
- Admin credentials: `admin / admin123` (seeded on first run)
- JWT secret: `SESSION_SECRET` env var
- OpenAI: Uses built-in Replit AI integration by default; customizable via admin Settings page (API key, base URL, model)
- Admin login: Hidden from public navbar; access via `/login` directly
- Public site: Project cards (companies) with properties, click to expand timeline of tasks, completed work highlights, milestones & tools/topics overview
- Companies have: name, industry, description, status, startDate, endDate, githubLink
- Tasks have: title, description, requestedBy, priority, projectArea, recommendedRole, status, companyId, solutionNotes, architectureNotes, githubLink, documentationLink
- Admin ManageTasks: all fields editable + AI Review button per task (score, strengths, improvements, suggestions, risks)
- Design: Electric indigo primary, Bricolage Grotesque + DM Sans fonts
- CSS utilities: `glass-panel`, `card-hover`
- Run: `npm run dev` (Start application workflow)

## API Routes
- `POST /api/auth/login` - Login, returns JWT
- `GET /api/auth/me` - Get current user (auth required)
- `GET/POST /api/companies` - List/create companies (includes githubLink)
- `GET/PATCH/DELETE /api/companies/:id` - Get/update/delete company
- `GET/POST /api/tasks` - List/create tasks (supports ?companyId filter)
- `GET/PATCH/DELETE /api/tasks/:id` - Get/update/delete task (all fields editable)
- `POST /api/tasks/:id/review` - AI review of task work (admin, returns score/feedback)
- `POST /api/generate-task` - AI task generation (admin)
- `GET/POST /api/contacts` - List (admin)/create contact requests
- `GET/PUT /api/settings` - Get/update app settings (admin)
- `DELETE /api/settings/:key` - Clear a setting (admin)
- `GET /api/dashboard/stats` - Dashboard analytics
