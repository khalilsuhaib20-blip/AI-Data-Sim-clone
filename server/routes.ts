import express from "express";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";
import { generateToken, comparePassword, requireAuth, requireAdmin, seedAdminUser } from "./auth";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|txt|md|sql|py|ts|js|json|csv|xlsx|zip)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

async function getOpenAIClient(): Promise<OpenAI> {
  const customApiKey = await storage.getSetting("openai_api_key");
  const customBaseUrl = await storage.getSetting("openai_base_url");

  return new OpenAI({
    apiKey: customApiKey || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: customBaseUrl || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

async function getAIModel(): Promise<string> {
  const customModel = await storage.getSetting("openai_model");
  return customModel || "gpt-4o";
}

async function seedDatabase() {
  await seedAdminUser();

  const existingCompanies = await storage.getCompanies();
  if (existingCompanies.length === 0) {
    const c1 = await storage.createCompany({
      name: "TechFlow Analytics",
      industry: "FinTech",
      description: "A fast-growing fintech startup building real-time payment analytics and fraud detection systems.",
      status: "active",
      startDate: "2024-01-15",
    });
    const c2 = await storage.createCompany({
      name: "HealthData Systems",
      industry: "Healthcare",
      description: "Enterprise healthcare platform focused on patient data interoperability and clinical analytics.",
      status: "active",
      startDate: "2024-03-01",
    });
    const c3 = await storage.createCompany({
      name: "RetailPulse AI",
      industry: "E-Commerce",
      description: "AI-powered retail analytics platform for demand forecasting and inventory optimization.",
      status: "paused",
      startDate: "2023-09-01",
      endDate: "2024-06-30",
    });

    await storage.createTask({
      companyId: c1.id,
      title: "Build real-time transaction anomaly detection pipeline",
      description: "Design and implement a streaming data pipeline that processes payment transactions in real-time and flags anomalies using statistical methods. Must handle 10K transactions/second.",
      requestedBy: "Data Engineer",
      priority: "urgent",
      projectArea: "Data Engineering",
      recommendedRole: "Data Engineer",
      assignedRole: "Data Engineer",
      difficulty: "hard",
      status: "in_progress",
      businessContext: "Fraud losses increased 15% last quarter. Real-time detection is critical for our merchant partners' trust and platform revenue.",
      solutionNotes: "Using Apache Kafka + Flink for stream processing with z-score based anomaly detection.",
      githubLink: "https://github.com/example/anomaly-pipeline",
    });
    await storage.createTask({
      companyId: c1.id,
      title: "Create merchant churn prediction model",
      description: "Build an ML model to predict which merchants are likely to churn in the next 90 days based on transaction volume trends, support tickets, and usage patterns.",
      requestedBy: "Stakeholder",
      priority: "high",
      projectArea: "Data Science",
      recommendedRole: "Data Scientist",
      assignedRole: "Data Scientist",
      difficulty: "medium",
      status: "backlog",
      businessContext: "We're losing 8% of merchants quarterly. A predictive model would let the customer success team intervene early.",
    });
    await storage.createTask({
      companyId: c2.id,
      title: "Design FHIR-compliant data warehouse schema",
      description: "Architect a data warehouse schema that supports FHIR R4 resources while enabling efficient analytical queries across patient demographics, encounters, and clinical observations.",
      requestedBy: "Software Engineer",
      priority: "high",
      projectArea: "Data Engineering",
      recommendedRole: "Data Engineer",
      assignedRole: "Data Engineer",
      difficulty: "hard",
      status: "completed",
      businessContext: "Hospital partners require FHIR compliance for data interoperability. Without it, we can't onboard new clients.",
      solutionNotes: "Implemented star schema with FHIR resource mapping layer. Used dbt for transformations.",
      githubLink: "https://github.com/example/fhir-warehouse",
      architectureNotes: "Snowflake as warehouse, dbt for transformations, Fivetran for ingestion",
    });
    await storage.createTask({
      companyId: c2.id,
      title: "Build clinical trial outcome dashboard",
      description: "Create an interactive dashboard showing clinical trial outcomes, patient enrollment rates, and adverse event tracking across all active trials.",
      requestedBy: "Analyst",
      priority: "medium",
      projectArea: "Analytics",
      recommendedRole: "Data Analyst",
      assignedRole: "Data Analyst",
      difficulty: "medium",
      status: "backlog",
      businessContext: "Clinical ops team spends 4 hours/week manually compiling trial metrics. This dashboard would eliminate that manual effort.",
    });
    await storage.createTask({
      companyId: c3.id,
      title: "Deploy demand forecasting model to production",
      description: "Containerize and deploy the demand forecasting model using MLflow. Set up model monitoring, A/B testing framework, and automated retraining pipeline.",
      requestedBy: "ML Engineer",
      priority: "high",
      projectArea: "MLOps",
      recommendedRole: "ML Engineer",
      assignedRole: "ML Engineer",
      difficulty: "hard",
      status: "completed",
      businessContext: "Inventory waste costs $2M/year. Deploying this model to production could reduce stockouts by 30%.",
      solutionNotes: "Deployed via MLflow + Kubernetes. Set up Evidently AI for drift monitoring.",
      githubLink: "https://github.com/example/demand-forecast-mlops",
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  // ========== AUTH ==========
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
      const token = generateToken(user.id, user.username, user.role);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.auth.me.path, requireAuth, async (req, res) => {
    const user = await storage.getUser(req.user!.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  // ========== COMPANIES ==========
  app.get(api.companies.list.path, async (_req, res) => {
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const company = await storage.getCompany(Number(req.params.id));
    if (!company) return res.status(404).json({ message: "Company not found" });
    const companyTasks = await storage.getTasksByCompany(company.id);
    res.json({ ...company, tasks: companyTasks });
  });

  app.post(api.companies.create.path, requireAuth, requireAdmin, async (req, res) => {
    try {
      const input = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(input);
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  app.patch(api.companies.update.path, requireAuth, requireAdmin, async (req, res) => {
    try {
      const input = api.companies.update.input.parse(req.body);
      const company = await storage.updateCompany(Number(req.params.id), input);
      if (!company) return res.status(404).json({ message: "Company not found" });
      res.json(company);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.companies.delete.path, requireAuth, requireAdmin, async (req, res) => {
    await storage.deleteCompany(Number(req.params.id));
    res.status(204).send();
  });

  // ========== AI COMPANY SUGGESTIONS ==========
  app.post("/api/companies/:id/suggest", requireAuth, requireAdmin, async (req, res) => {
    try {
      const company = await storage.getCompany(Number(req.params.id));
      if (!company) return res.status(404).json({ message: "Company not found" });

      const openai = await getOpenAIClient();
      const model = await getAIModel();
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: "system",
          content: `You are a CTO designing the technical foundation for a new data/AI engineering project.

Company: ${company.name}
Industry: ${company.industry}
Description: ${company.description}

Based on this company's domain and goals, suggest a realistic technical setup. Return JSON with:

- techStack: string — comma-separated list of technologies (e.g. "Python, Apache Spark, dbt, Snowflake, Airflow, Docker, Kubernetes, Terraform")
- architecture: string — a brief description of the system architecture (2-3 sentences covering data flow, storage, processing, and serving layers)
- phases: array of strings — ordered project phases the company would go through (e.g. ["Data Ingestion", "Data Storage & Modeling", "ETL/ELT Pipelines", "Analytics & Reporting", "Machine Learning", "MLOps & Monitoring"])
- roles: array of strings — team roles needed (e.g. ["Data Engineer", "Data Analyst", "Data Scientist", "ML Engineer", "Analytics Engineer", "MLOps Engineer", "Software Engineer", "Stakeholder"])

Make it realistic and specific to the industry. Include 5-8 phases and 4-8 roles.`
        }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Failed to generate suggestions");
      const suggestions = JSON.parse(content);
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // ========== ROADMAP ==========
  app.get("/api/companies/:id/roadmap", async (req, res) => {
    const roadmap = await storage.getRoadmap(Number(req.params.id));
    res.json(roadmap);
  });

  app.post("/api/companies/:id/roadmap/generate", requireAuth, requireAdmin, async (req, res) => {
    try {
      const company = await storage.getCompany(Number(req.params.id));
      if (!company) return res.status(404).json({ message: "Company not found" });

      let phases: string[] = [];
      if (company.phases) {
        try { phases = JSON.parse(company.phases); } catch {}
      }

      const openai = await getOpenAIClient();
      const model = await getAIModel();
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: "system",
          content: `You are a CTO creating a project roadmap for a data/AI engineering team.

Company: ${company.name}
Industry: ${company.industry}
Description: ${company.description}
Tech Stack: ${company.techStack || "Not specified"}
Architecture: ${company.architecture || "Not specified"}
${phases.length > 0 ? `Project Phases: ${phases.join(", ")}` : ""}

Generate a detailed roadmap with phases and milestones. Each milestone should be a concrete deliverable or achievement.

Return JSON with:
- roadmap: array of objects, each with:
  - phase: string (phase name)
  - milestone: string (specific milestone/deliverable name)
  - description: string (brief description of what this milestone entails)

Generate 3-5 milestones per phase. Order them logically — earlier phases should be foundational, later phases build on them.
${phases.length > 0 ? `Use these phases: ${phases.join(", ")}` : "Use realistic data engineering project phases."}`
        }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Failed to generate roadmap");
      const result = JSON.parse(content);

      await storage.deleteRoadmapByCompany(company.id);

      const items = result.roadmap || [];
      const created = [];
      for (let i = 0; i < items.length; i++) {
        const item = await storage.createRoadmapItem({
          companyId: company.id,
          phase: items[i].phase,
          milestone: items[i].milestone,
          description: items[i].description || null,
          orderIndex: i,
          status: "pending",
        });
        created.push(item);
      }
      res.json(created);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      res.status(500).json({ message: "Failed to generate roadmap" });
    }
  });

  app.post("/api/companies/:id/roadmap/evolve", requireAuth, requireAdmin, async (req, res) => {
    try {
      const company = await storage.getCompany(Number(req.params.id));
      if (!company) return res.status(404).json({ message: "Company not found" });

      const existingRoadmap = await storage.getRoadmap(company.id);
      const existingTasks = await storage.getTasksByCompany(company.id);
      const completedTasks = existingTasks.filter(t => t.status === "completed").map(t => t.title);
      const activeTasks = existingTasks.filter(t => t.status === "in_progress").map(t => `${t.title}${t.progressNotes ? ` (Progress: ${t.progressNotes})` : ""}`);

      const openai = await getOpenAIClient();
      const model = await getAIModel();
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: "system",
          content: `You are a CTO simulating realistic project evolution for a data/AI team.

Company: ${company.name}
Industry: ${company.industry}
Description: ${company.description}
Tech Stack: ${company.techStack || "Not specified"}

Current roadmap phases and milestones:
${existingRoadmap.map(r => `- [${r.status}] ${r.phase}: ${r.milestone}`).join("\n")}

Completed tasks: ${completedTasks.length > 0 ? completedTasks.join(", ") : "None yet"}
Active tasks: ${activeTasks.length > 0 ? activeTasks.join("; ") : "None"}

Introduce 1-3 realistic new events that would naturally occur in a growing data/AI company. These could be:
- Stakeholder feature requests
- Data quality incidents
- Scaling/performance issues
- ML model performance degradation
- New regulatory requirements
- Integration requests from other teams
- Infrastructure failures or tech debt

Return JSON with:
- events: array of objects, each with:
  - type: string (e.g. "feature_request", "incident", "scaling", "tech_debt", "regulation")
  - title: string (brief event title)
  - description: string (what happened)
  - newMilestones: array of objects with { phase: string, milestone: string, description: string } — new roadmap items this event creates
  - suggestedTaskTitle: string — a task title that should be created to address this event`
        }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Failed to evolve roadmap");
      const result = JSON.parse(content);

      const maxOrder = existingRoadmap.length > 0
        ? Math.max(...existingRoadmap.map(r => r.orderIndex)) + 1
        : 0;

      const newItems = [];
      let orderOffset = 0;
      for (const event of (result.events || [])) {
        for (const ms of (event.newMilestones || [])) {
          const item = await storage.createRoadmapItem({
            companyId: company.id,
            phase: ms.phase,
            milestone: ms.milestone,
            description: ms.description || null,
            orderIndex: maxOrder + orderOffset,
            status: "pending",
          });
          newItems.push(item);
          orderOffset++;
        }
      }

      res.json({ events: result.events, newRoadmapItems: newItems });
    } catch (error) {
      console.error("Error evolving roadmap:", error);
      res.status(500).json({ message: "Failed to evolve roadmap" });
    }
  });

  // ========== TASKS ==========
  app.get(api.tasks.list.path, async (req, res) => {
    const companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    const allTasks = companyId ? await storage.getTasksByCompany(companyId) : await storage.getTasks();
    res.json(allTasks);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  });

  app.post(api.tasks.create.path, requireAuth, requireAdmin, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  app.patch(api.tasks.update.path, requireAuth, requireAdmin, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, requireAuth, requireAdmin, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // ========== PROGRESS NOTES ==========
  app.patch("/api/tasks/:id/progress", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { progressNotes } = z.object({ progressNotes: z.string() }).parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), { progressNotes });
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // ========== GENERATE TASK (CTO SIMULATOR) ==========
  app.post(api.tasks.generate.path, requireAuth, requireAdmin, async (req, res) => {
    try {
      const { companyId, milestoneId, progressContext } = req.body || {};
      let company = null;
      let milestone = null;
      let roadmapContext = "";

      if (companyId) {
        company = await storage.getCompany(companyId);
      }
      if (milestoneId) {
        const roadmap = company ? await storage.getRoadmap(company.id) : [];
        milestone = roadmap.find(r => r.id === milestoneId);
      }

      const recentTasks = company
        ? await storage.getTasksByCompany(company.id)
        : await storage.getTasks();
      const recentTaskTitles = recentTasks.slice(0, 15).map(t => t.title);

      if (company) {
        const roadmap = await storage.getRoadmap(company.id);
        if (roadmap.length > 0) {
          roadmapContext = `\nProject Roadmap:\n${roadmap.map(r => `- [${r.status}] ${r.phase}: ${r.milestone}`).join("\n")}`;
        }
      }

      const roles = company?.roles
        ? (() => { try { return JSON.parse(company.roles); } catch { return null; } })()
        : null;
      const roleList = roles && Array.isArray(roles) ? roles.join(", ") : "Stakeholder, Data Engineer, Data Analyst, Data Scientist, ML Engineer, MLOps Engineer, Analytics Engineer, Software Engineer";

      const openai = await getOpenAIClient();
      const model = await getAIModel();
      const response = await openai.chat.completions.create({
        model,
        messages: [{
          role: "system",
          content: `You are a CTO assigning realistic engineering work to your data/AI team. You create tasks that resemble real Jira tickets — specific, actionable, and grounded in business needs.

Company: ${company?.name || "General"} (${company?.industry || "Technology"})
Description: ${company?.description || "A technology company"}
Tech Stack: ${company?.techStack || "Not specified"}
Architecture: ${company?.architecture || "Not specified"}
${roadmapContext}
${milestone ? `\nCurrent Milestone: ${milestone.phase} → ${milestone.milestone}${milestone.description ? ` (${milestone.description})` : ""}` : ""}
${progressContext ? `\nDeveloper Progress Context: ${progressContext}` : ""}

Available team roles: ${roleList}

IMPORTANT: Do NOT generate tasks similar to these recent ones:
${recentTaskTitles.length > 0 ? recentTaskTitles.map(t => `- ${t}`).join("\n") : "No recent tasks yet."}

Generate a realistic engineering task. Return JSON with:
- title: string (concise, specific task title like a Jira ticket)
- description: string (detailed technical description — what needs to be built, why, and key requirements)
- requestedBy: string (the role requesting this work — pick from the available roles)
- assignedRole: string (the role best suited to do this work)
- priority: "low" | "medium" | "high" | "urgent"
- projectArea: one of "Data Engineering", "Data Science", "Analytics", "MLOps", "DataOps", "Analytics Engineering"
- difficulty: "easy" | "medium" | "hard" | "expert"
- businessContext: string (1-2 sentences explaining WHY this task matters to the business)
- subtasks: array of strings (3-6 specific subtasks/checklist items)
- deliverables: array of strings (2-4 expected deliverables)
- recommendedRole: string (same as assignedRole, for backward compatibility)`
        }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Failed to generate task");
      const generated = JSON.parse(content);

      const generatedSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        requestedBy: z.string().min(1),
        assignedRole: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        projectArea: z.string().min(1),
        difficulty: z.string().optional(),
        businessContext: z.string().optional(),
        subtasks: z.array(z.string()).optional(),
        deliverables: z.array(z.string()).optional(),
        recommendedRole: z.string().optional(),
      });
      const validated = generatedSchema.parse(generated);

      const task = await storage.createTask({
        companyId: companyId || null,
        milestoneId: milestoneId || null,
        title: validated.title,
        description: validated.description,
        requestedBy: validated.requestedBy,
        priority: validated.priority,
        projectArea: validated.projectArea,
        recommendedRole: validated.recommendedRole || validated.assignedRole || null,
        assignedRole: validated.assignedRole || validated.recommendedRole || null,
        difficulty: validated.difficulty || null,
        businessContext: validated.businessContext || null,
        subtasks: validated.subtasks ? JSON.stringify(validated.subtasks) : null,
        deliverables: validated.deliverables ? JSON.stringify(validated.deliverables) : null,
        status: "backlog",
      });
      res.status(201).json(task);
    } catch (error) {
      console.error("Error generating task:", error);
      res.status(500).json({ message: "Failed to generate task" });
    }
  });

  // ========== FILE UPLOADS ==========
  app.use("/uploads", express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }));

  app.post("/api/upload", requireAuth, requireAdmin, upload.array("files", 5), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const urls = files.map(f => ({
      url: `/uploads/${f.filename}`,
      name: f.originalname,
      size: f.size,
      type: f.mimetype,
    }));
    res.json({ files: urls });
  });

  // ========== CONTACTS ==========
  app.get(api.contacts.list.path, requireAuth, requireAdmin, async (_req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.post(api.contacts.create.path, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  // ========== SETTINGS ==========
  app.get("/api/settings", requireAuth, requireAdmin, async (_req, res) => {
    const allSettings = await storage.getAllSettings();
    const settingsMap: Record<string, string> = {};
    for (const s of allSettings) {
      if (s.key === "openai_api_key" && s.value) {
        settingsMap[s.key] = s.value.slice(0, 8) + "..." + s.value.slice(-4);
      } else {
        settingsMap[s.key] = s.value;
      }
    }
    res.json(settingsMap);
  });

  app.put("/api/settings", requireAuth, requireAdmin, async (req, res) => {
    try {
      const input = z.record(z.string(), z.string()).parse(req.body);
      for (const [key, value] of Object.entries(input)) {
        if (value.includes("...") && key === "openai_api_key") continue;
        if (value) {
          await storage.setSetting(key, value);
        }
      }
      res.json({ message: "Settings saved" });
    } catch (err) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  app.delete("/api/settings/:key", requireAuth, requireAdmin, async (req, res) => {
    const key = req.params.key;
    await storage.setSetting(key, "");
    res.json({ message: `Setting '${key}' cleared` });
  });

  // ========== DASHBOARD ==========
  app.get(api.dashboard.stats.path, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  return httpServer;
}
