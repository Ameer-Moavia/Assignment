// src/controllers/user.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const listUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { id: "asc" } });
  return res.json(users);
};

export const updateRole = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { role } = req.body as { role: "ADMIN" | "ORGANIZER" | "PARTICIPANT" };
  if (!["ADMIN", "ORGANIZER", "PARTICIPANT"].includes(role)) return res.status(400).json({ error: "Invalid role" });

  const user = await prisma.user.update({ where: { id }, data: { role } });

  if (role === "ADMIN" || role === "ORGANIZER") {
    const exists = await prisma.organizerProfile.findUnique({ where: { userId: id } });
    if (!exists) await prisma.organizerProfile.create({ data: { userId: id, name: user.name ?? user.email } });
  } else if (role === "PARTICIPANT") {
    const exists = await prisma.participantProfile.findUnique({ where: { userId: id } });
    if (!exists) await prisma.participantProfile.create({ data: { userId: id, name: user.name ?? user.email } });
  }

  return res.json({ id: user.id, email: user.email, role: user.role });
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.user.delete({ where: { id } });
  return res.json({ message: "User deleted",status: 200 });
};
