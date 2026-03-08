import { z } from "zod";
import { insertTaskSchema, insertCompanySchema, insertContactSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/auth/login" as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ token: z.string(), user: z.object({ id: z.number(), username: z.string(), role: z.string() }) }),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  companies: {
    list: { method: "GET" as const, path: "/api/companies" as const, responses: { 200: z.array(z.any()) } },
    get: { method: "GET" as const, path: "/api/companies/:id" as const, responses: { 200: z.any(), 404: errorSchemas.notFound } },
    create: { method: "POST" as const, path: "/api/companies" as const, input: insertCompanySchema, responses: { 201: z.any(), 400: errorSchemas.validation } },
    update: { method: "PATCH" as const, path: "/api/companies/:id" as const, input: insertCompanySchema.partial(), responses: { 200: z.any(), 404: errorSchemas.notFound } },
    delete: { method: "DELETE" as const, path: "/api/companies/:id" as const, responses: { 204: z.void(), 404: errorSchemas.notFound } },
  },
  tasks: {
    list: { method: "GET" as const, path: "/api/tasks" as const, responses: { 200: z.array(z.any()) } },
    get: { method: "GET" as const, path: "/api/tasks/:id" as const, responses: { 200: z.any(), 404: errorSchemas.notFound } },
    create: { method: "POST" as const, path: "/api/tasks" as const, input: insertTaskSchema, responses: { 201: z.any(), 400: errorSchemas.validation } },
    update: { method: "PATCH" as const, path: "/api/tasks/:id" as const, input: insertTaskSchema.partial(), responses: { 200: z.any(), 404: errorSchemas.notFound } },
    delete: { method: "DELETE" as const, path: "/api/tasks/:id" as const, responses: { 204: z.void(), 404: errorSchemas.notFound } },
    generate: { method: "POST" as const, path: "/api/generate-task" as const, input: z.object({ companyId: z.number().optional() }).optional(), responses: { 201: z.any(), 500: errorSchemas.internal } },
  },
  contacts: {
    list: { method: "GET" as const, path: "/api/contacts" as const, responses: { 200: z.array(z.any()) } },
    create: { method: "POST" as const, path: "/api/contacts" as const, input: insertContactSchema, responses: { 201: z.any(), 400: errorSchemas.validation } },
  },
  dashboard: {
    stats: { method: "GET" as const, path: "/api/dashboard/stats" as const, responses: { 200: z.any() } },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type TaskInput = z.infer<typeof api.tasks.create.input>;
export type TaskUpdateInput = z.infer<typeof api.tasks.update.input>;
export type CompanyInput = z.infer<typeof api.companies.create.input>;
export type CompanyUpdateInput = z.infer<typeof api.companies.update.input>;
export type ContactInput = z.infer<typeof api.contacts.create.input>;
export type LoginInput = z.infer<typeof api.auth.login.input>;
