import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("viewer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  githubLink: text("github_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requestedBy: varchar("requested_by", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull(),
  projectArea: varchar("project_area", { length: 100 }).notNull(),
  recommendedRole: varchar("recommended_role", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("backlog"),
  solutionNotes: text("solution_notes"),
  architectureNotes: text("architecture_notes"),
  githubLink: text("github_link"),
  documentationLink: text("documentation_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactRequests = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  relatedCompany: text("related_company"),
  relatedTask: text("related_task"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contactRequests).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type AppSetting = typeof appSettings.$inferSelect;
