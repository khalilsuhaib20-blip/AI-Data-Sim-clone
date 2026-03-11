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
- **Diagrams**: mermaid (architecture diagram rendering)
- **Icons**: lucide-react, react-icons/si

## Architecture

### Shared (`shared/`)
- `schema.ts` - Drizzle schema: users, companies (with `visible`, `architectureDiagram`), tasks, projectRoadmap, contactRequests, appSettings
- `routes.ts` - API route definitions, Zod schemas, type exports

### Server (`server/`)
- `routes.ts` - All API endpoints with auth middleware, dynamic OpenAI config, CTO task generator, AI company suggestions, roadmap management, incident simulation, GitHub proxy, prompt DB storage
- `storage.ts` - Database CRUD via IStorage interface
- `auth.ts` - JWT generation/verification, bcrypt, middleware (requireAuth/requireAdmin/verifyToken), admin seeder
- `db.ts` - Drizzle database connection

### Client (`client/src/`)
- `App.tsx` - Routes: admin routes wrapped in `AdminLayout`; public routes in clean `PublicRoutes` with `Navbar`
- `lib/auth.tsx` - AuthProvider context, useAuth hook
- `hooks/use-tasks.ts` - Task queries/mutations
- `hooks/use-companies.ts` - Company queries/mutations + useSuggestCompany, useSimulateIncident, useRoadmap, useGenerateRoadmap, useEvolveRoadmap (all auth-aware)
- `hooks/use-page-meta.ts` - Dynamic `<meta>` tag updates for OG / Twitter card / description
- `components/layout/AdminLayout.tsx` - Full shadcn Sidebar layout with nav links, user info, logout
- `components/layout/Navbar.tsx` - Minimal public nav with Admin Console button when logged in
- `components/views/TaskCard.tsx` - Expandable task card with incident detection ([INCIDENT] prefix → red border + badge)
- `components/TaskWorkflow.tsx` - 3-step guided dialog: Start → Solution → Complete with status auto-updates
- `components/MermaidDiagram.tsx` - Renders Mermaid diagram syntax as SVG
- `components/GitHubRepoCard.tsx` - GitHub repo enrichment card (stars, language, topics, last commit)

### Pages
- **Public**:
  - `PortfolioDashboard` - Project cards with categorized tech stack badges, company detail with arch diagram, phase stepper, role chips, LinkedIn share, roadmap with PDF export
  - `TaskDetails` - Task detail with GitHub card, LinkedIn share, solution notes
  - `Login`
- **Admin** (JWT + admin role required, all wrapped in `AdminLayout` sidebar):
  - `AdminDashboard`, `ManageCompanies` (CRUD + visibility toggle + TechStackPicker + incident simulation + Mermaid diagram preview), `ManageTasks` (task workflow button), `GenerateTask`, `ContactRequests`, `Settings`, `Prompts` (AI prompt editor)

## Data Model

### Companies
- name, industry, description, status, startDate, endDate, githubLink
- techStack (comma-separated string of technologies)
- architecture (system architecture description)
- architectureDiagram (Mermaid diagram definition)
- phases (JSON array of phase names)
- roles (JSON array of team roles)
- visible (boolean, default true — public filter)

### Tasks
- title, description, requestedBy, priority, projectArea, recommendedRole, status, companyId
- difficulty, businessContext, subtasks (JSON array), deliverables (JSON array)
- assignedRole, milestoneId, progressNotes, solutionNotes, architectureNotes
- githubLink, documentationLink
- Incident tasks have `[INCIDENT]` prefix in title, priority=urgent, status=in_progress

### Project Roadmap
- companyId, phase, milestone, description, orderIndex, status

### App Settings (key-value store)
- Includes AI prompts: `prompt_company_suggest`, `prompt_roadmap_generate`, `prompt_roadmap_evolve`, `prompt_task_generate`, `prompt_incident_simulate`
- OpenAI config: `openai_api_key`, `openai_base_url`, `openai_model`

## Key Details
- Admin credentials: `admin / admin123` (seeded on first run)
- JWT secret: `SESSION_SECRET` env var
- OpenAI: Uses built-in Replit AI integration by default; customizable via admin Settings
- Task statuses: `backlog` / `in_progress` / `completed`
- Design: Electric indigo primary, Bricolage Grotesque + DM Sans fonts
- CSS utilities: `glass-panel`, `card-hover`; print styles for roadmap PDF export
- Run: `npm run dev` (Start application workflow)

## API Routes
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user
- `GET/POST /api/companies` — List (public: visible only; admin: all) / create
- `GET/PATCH/DELETE /api/companies/:id` — Get / update / delete
- `POST /api/companies/:id/suggest` — AI suggests tech stack, arch, phases, roles
- `GET /api/companies/:id/roadmap` — Get roadmap milestones
- `POST /api/companies/:id/roadmap/generate` — AI generates roadmap
- `POST /api/companies/:id/roadmap/evolve` — AI evolves roadmap
- `POST /api/companies/:id/incident` — AI generates incident + creates urgent task
- `GET /api/github-repo?url=` — GitHub repo metadata proxy (1hr cache)
- `GET/POST /api/tasks` — List / create tasks
- `GET/PATCH/DELETE /api/tasks/:id` — Get / update / delete
- `POST /api/generate-task` — CTO-style AI task generation
- `GET/POST /api/contacts` — Contact requests
- `GET/PUT /api/settings` — App settings (includes AI prompts)
- `GET /api/dashboard/stats` — Dashboard analytics

## Tech Stack Tag Categories (TechStackPicker)
- Microsoft / Power Platform: Excel, Power BI, Power Apps, Power Automate, Azure Data Factory, Microsoft Fabric, etc.
- Data Engineering: Kafka, Flink, Spark, Airflow, dbt, Snowflake, BigQuery, etc.
- ML / AI: Python, scikit-learn, TensorFlow, PyTorch, MLflow, Evidently AI, OpenAI, etc.
- DevOps / Infra: Kubernetes, Docker, Terraform, GitHub Actions, AWS, GCP, Azure, etc.
- Analytics / BI: Tableau, Looker, Metabase, Grafana, Apache Superset
