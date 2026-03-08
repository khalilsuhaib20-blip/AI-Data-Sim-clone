import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret-key";

export function generateToken(userId: number, username: string, role: string): string {
  return jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; username: string; role: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  req.user = decoded;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function seedAdminUser() {
  const existing = await storage.getUserByUsername("admin");
  if (!existing) {
    const hash = await hashPassword("admin123");
    await storage.createUser({ username: "admin", passwordHash: hash, role: "admin" });
    console.log("Admin user created (username: admin, password: admin123)");
  }
}
