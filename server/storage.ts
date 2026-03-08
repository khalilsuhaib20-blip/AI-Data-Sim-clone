import { db } from "./db";
import {
  users, companies, tasks, contactRequests,
  type InsertUser, type User,
  type InsertCompany, type Company,
  type InsertTask, type Task,
  type InsertContact, type ContactRequest,
} from "@shared/schema";
import { eq, desc, count, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;

  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByCompany(companyId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  getContacts(): Promise<ContactRequest[]>;
  createContact(contact: InsertContact): Promise<ContactRequest>;

  getDashboardStats(): Promise<{
    totalCompanies: number;
    activeCompanies: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    backlogTasks: number;
    tasksByCompany: { companyName: string; count: number }[];
    tasksByRole: { role: string; count: number }[];
    tasksByArea: { area: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(user: InsertUser) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getCompanies() {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }
  async getCompany(id: number) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  async createCompany(company: InsertCompany) {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }
  async updateCompany(id: number, updates: Partial<InsertCompany>) {
    const [updated] = await db.update(companies).set(updates).where(eq(companies.id, id)).returning();
    return updated;
  }
  async deleteCompany(id: number) {
    await db.delete(companies).where(eq(companies.id, id));
  }

  async getTasks() {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }
  async getTask(id: number) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  async getTasksByCompany(companyId: number) {
    return db.select().from(tasks).where(eq(tasks.companyId, companyId)).orderBy(desc(tasks.createdAt));
  }
  async createTask(task: InsertTask) {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }
  async updateTask(id: number, updates: Partial<InsertTask>) {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }
  async deleteTask(id: number) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getContacts() {
    return db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt));
  }
  async createContact(contact: InsertContact) {
    const [newContact] = await db.insert(contactRequests).values(contact).returning();
    return newContact;
  }

  async getDashboardStats() {
    const allCompanies = await db.select().from(companies);
    const allTasks = await db.select().from(tasks);

    const tasksByCompany: { companyName: string; count: number }[] = [];
    const companyMap = new Map(allCompanies.map(c => [c.id, c.name]));
    const companyCount: Record<string, number> = {};
    const roleCount: Record<string, number> = {};
    const areaCount: Record<string, number> = {};

    for (const task of allTasks) {
      const companyName = task.companyId ? companyMap.get(task.companyId) || "Unassigned" : "Unassigned";
      companyCount[companyName] = (companyCount[companyName] || 0) + 1;
      roleCount[task.requestedBy] = (roleCount[task.requestedBy] || 0) + 1;
      areaCount[task.projectArea] = (areaCount[task.projectArea] || 0) + 1;
    }

    return {
      totalCompanies: allCompanies.length,
      activeCompanies: allCompanies.filter(c => c.status === "active").length,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === "completed").length,
      inProgressTasks: allTasks.filter(t => t.status === "in_progress").length,
      backlogTasks: allTasks.filter(t => t.status === "backlog").length,
      tasksByCompany: Object.entries(companyCount).map(([companyName, count]) => ({ companyName, count })),
      tasksByRole: Object.entries(roleCount).map(([role, count]) => ({ role, count })),
      tasksByArea: Object.entries(areaCount).map(([area, count]) => ({ area, count })),
    };
  }
}

export const storage = new DatabaseStorage();
