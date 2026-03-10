# AI Data Company Simulator Portfolio

## Overview
Full-stack React + Express portfolio web app that simulates working at multiple data companies. Features AI-powered engineering task simulation (CTO-style task generation), smart company setup with AI-suggested tech stacks, project roadmaps with phases and milestones, progress tracking, and a public portfolio dashboard.

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
- `schema.ts` - Drizzle schema: users, companies, tasks, projectRoadmap, contactRequests, appSettings
- `routes.ts` - API route definitions, Zod schemas, type exports

### Server (`server/`)
- `routes.ts` - All API endpoints with auth middleware, dynamic OpenAI config, CTO task generator, AI company suggestions, roadmap management
- `storage.ts` - Database CRUD via IStorage interface (includes roadmap, settings)
- `auth.ts` - JWT generation/verification, bcrypt, middleware (requireAuth/requireAdmin), admin seeder
- `db.ts` - Drizzle database connection

### Client (`client/src/`)
- `App.tsx` - Routes + AuthProvider + Navbar (public: / and /login; admin: /admin/*)
- `lib/auth.tsx` - AuthProvider context, useAuth hook
- `hooks/use-tasks.ts` - Task queries/mutations + useUpdateProgress, useGenerateTask
- `hooks/use-companies.ts` - Company queries/mutations + useSuggestCompany, useRoadmap, useGenerateRoadmap, useEvolveRoadmap
- `components/layout/Navbar.tsx` - Minimal public nav, full admin nav
- `components/views/` - TimelineView, TaskCard (expandable with subtasks/deliverables)
- `components/ContactModal.tsx` - Task detail + contact form modal

### Pages
- **Public**: PortfolioDashboard (/ - project cards with tech stack/roles, timeline drill-down with expandable task cards, roadmap view, completed work showcase, milestones/tools summary), Login
- **Admin** (require JWT + admin role): AdminDashboard, ManageCompanies (CRUD + AI suggestions + roadmap generation/evolution), ManageTasks (task detail popup with progress notes + generate next task), GenerateTask (CTO simulator with milestone targeting), ContactRequests, Settings

## Data Model

### Companies
- name, industry, description, status, startDate, endDate, githubLink
- techStack (text — comma-separated or JSON array of technologies)
- architecture (text — system architecture description)
- phases (text — JSON array of phase names)
- roles (text — JSON array of team roles)

### Tasks
- title, description, requestedBy, priority, projectArea, recommendedRole, status, companyId
- difficulty (easy/medium/hard/expert)
- businessContext (text — why this task matters to the business)
- subtasks (text — JSON array of subtask descriptions)
- deliverables (text — JSON array of expected deliverables)
- assignedRole (text — role assigned to this task)
- milestoneId (FK to project_roadmap)
- progressNotes (text — admin progress tracking notes)
- solutionNotes, architectureNotes, githubLink, documentationLink

### Project Roadmap
- companyId, phase, milestone, description, orderIndex, status (pending/in_progress/completed)

## Key Details
- Admin credentials: `admin / admin123` (seeded on first run)
- JWT secret: `SESSION_SECRET` env var
- OpenAI: Uses built-in Replit AI integration by default; customizable via admin Settings page (API key, base URL, model)
- Admin login: Hidden from public navbar; access via `/login` directly
- Task statuses: `backlog` (Backlog), `in_progress` (Active), `completed` (Closed)
- File upload: drag-and-drop or click Upload button, files stored in `uploads/` directory, served at `/uploads/*`, max 10MB
- Design: Electric indigo primary, Bricolage Grotesque + DM Sans fonts
- CSS utilities: `glass-panel`, `card-hover`
- Run: `npm run dev` (Start application workflow)

## API Routes
- `POST /api/auth/login` - Login, returns JWT
- `GET /api/auth/me` - Get current user (auth required)
- `GET/POST /api/companies` - List/create companies
- `GET/PATCH/DELETE /api/companies/:id` - Get/update/delete company
- `POST /api/companies/:id/suggest` - AI suggests techStack, architecture, phases, roles (admin)
- `GET /api/companies/:id/roadmap` - Get roadmap for company
- `POST /api/companies/:id/roadmap/generate` - AI generates roadmap (admin)
- `POST /api/companies/:id/roadmap/evolve` - AI evolves roadmap with new events (admin)
- `GET/POST /api/tasks` - List/create tasks (supports ?companyId filter)
- `GET/PATCH/DELETE /api/tasks/:id` - Get/update/delete task
- `PATCH /api/tasks/:id/progress` - Update progress notes (admin)
- `POST /api/generate-task` - CTO-style AI task generation with duplicate avoidance (admin)
- `POST /api/upload` - Upload files (admin, multipart form, max 5 files)
- `GET/POST /api/contacts` - List (admin)/create contact requests
- `GET/PUT /api/settings` - Get/update app settings (admin)
- `DELETE /api/settings/:key` - Clear a setting (admin)
- `GET /api/dashboard/stats` - Dashboard analytics
