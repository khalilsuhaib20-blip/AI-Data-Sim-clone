import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function seedDatabase() {
  const existingTasks = await storage.getTasks();
  if (existingTasks.length === 0) {
    await storage.createTask({
      title: "Fix broken ETL pipeline",
      description: "The nightly ETL pipeline failed last night. Need someone to investigate and fix.",
      requestedBy: "Data Engineer",
      priority: "urgent",
      projectArea: "Data Engineering",
      status: "backlog"
    });
    await storage.createTask({
      title: "Build churn prediction model",
      description: "We need a new model to predict user churn for the Q4 marketing campaign.",
      requestedBy: "Data Scientist",
      priority: "high",
      projectArea: "Data Science",
      status: "in_progress"
    });
    await storage.createTask({
      title: "Update daily active users dashboard",
      description: "The DAU dashboard is missing data for the new mobile app users.",
      requestedBy: "Stakeholder",
      priority: "medium",
      projectArea: "Analytics",
      status: "completed",
      solutionNotes: "Added new source table for mobile events",
      githubLink: "https://github.com/example/repo/pull/123"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed initial tasks
  await seedDatabase();

  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.tasks.generate.path, async (req, res) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          {
            role: "system",
            content: "You are simulating a real tech company. Generate a realistic task request for a data team member. The task should come from one of these roles: Stakeholder, Software Engineer, Data Scientist, ML Engineer, or Analyst. Return structured JSON with these exactly matching fields: title (string), description (string), requestedBy (string), priority (string: 'low', 'medium', 'high', 'urgent'), projectArea (string: 'Data Engineering', 'Data Science', 'Analytics', 'MLOps')."
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Failed to generate task");
      }

      const generatedTask = JSON.parse(content);
      const task = await storage.createTask({
        title: generatedTask.title,
        description: generatedTask.description,
        requestedBy: generatedTask.requestedBy,
        priority: generatedTask.priority,
        projectArea: generatedTask.projectArea,
        status: "backlog"
      });

      res.status(201).json(task);
    } catch (error) {
      console.error("Error generating task:", error);
      res.status(500).json({ message: "Failed to generate task" });
    }
  });

  return httpServer;
}
