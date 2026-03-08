import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requestedBy: varchar("requested_by", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(),
  projectArea: varchar("project_area", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("backlog"),
  solutionNotes: text("solution_notes"),
  githubLink: text("github_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true, 
  createdAt: true 
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// API Contract Types
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type TaskResponse = Task;
export type TaskListResponse = Task[];
