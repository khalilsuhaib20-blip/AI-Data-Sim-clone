import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { generateToken, comparePassword, requireAuth, requireAdmin, seedAdminUser } from "./auth";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
      status: "in_progress",
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
      status: "backlog",
    });
    await storage.createTask({
      companyId: c2.id,
      title: "Design FHIR-compliant data warehouse schema",
      description: "Architect a data warehouse schema that supports FHIR R4 resources while enabling efficient analytical queries across patient demographics, encounters, and clinical observations.",
      requestedBy: "Software Engineer",
      priority: "high",
      projectArea: "Data Engineering",
      recommendedRole: "Data Engineer",
      status: "completed",
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
      status: "backlog",
    });
    await storage.createTask({
      companyId: c3.id,
      title: "Deploy demand forecasting model to production",
      description: "Containerize and deploy the demand forecasting model using MLflow. Set up model monitoring, A/B testing framework, and automated retraining pipeline.",
      requestedBy: "ML Engineer",
      priority: "high",
      projectArea: "MLOps",
      recommendedRole: "ML Engineer",
      status: "completed",
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

  // ========== GENERATE TASK ==========
  app.post(api.tasks.generate.path, requireAuth, requireAdmin, async (req, res) => {
    try {
      const companyId = req.body?.companyId;
      let industry = "Technology";
      if (companyId) {
        const company = await storage.getCompany(companyId);
        if (company) industry = company.industry;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [{
          role: "system",
          content: `You are simulating a real technology company team.

Generate a realistic task request for a data professional.

Company industry: ${industry}

Possible roles requesting work:
Stakeholder, Software Engineer, Data Engineer, Data Scientist, ML Engineer, Analyst

Return JSON with:
title, description, requestedBy, priority (low/medium/high/urgent), projectArea (Data Engineering/Data Science/Analytics/MLOps), recommendedRole, deliverables`
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
        priority: z.enum(["low", "medium", "high", "urgent"]),
        projectArea: z.string().min(1),
        recommendedRole: z.string().optional(),
      });
      const validated = generatedSchema.parse(generated);

      const task = await storage.createTask({
        companyId: companyId || null,
        title: validated.title,
        description: validated.description,
        requestedBy: validated.requestedBy,
        priority: validated.priority,
        projectArea: validated.projectArea,
        recommendedRole: validated.recommendedRole || null,
        status: "backlog",
      });
      res.status(201).json(task);
    } catch (error) {
      console.error("Error generating task:", error);
      res.status(500).json({ message: "Failed to generate task" });
    }
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

  // ========== DASHBOARD ==========
  app.get(api.dashboard.stats.path, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  return httpServer;
}
