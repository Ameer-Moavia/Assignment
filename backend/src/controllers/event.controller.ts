// src/controllers/event.controller.ts
import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { AttachmentType } from "@prisma/client";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const me = req.user!;
    const {
      title, description, type,
      venue, joinLink, contactInfo,
      totalSeats, requiresApproval, joinQuestions,
      startDate, endDate, companyId, organizerId, status, TypeOfEvent
    } = req.body as any;

    if (!title || !description || !type || !startDate || !endDate) return res.status(400).json({ error: "Missing required fields" });

    // ensure organizer profile

    if (!req.files?.length) return res.status(400).json({ error: "At least one attachment is required" });

    // attachments uploaded by multer-cloudinary available in req.files
    const files = req.files as Express.Multer.File[] | undefined;
    // files are objects with path (url) and filename or public_id (multer-storage-cloudinary sets path)
    // but multer-storage-cloudinary (v4) stores info in file.path or file.filename; confirm when running
    const attachmentsData = (files || []).map((f: any) => ({
      url: f.path || f.url,
      type: f.mimetype?.startsWith("video") ? AttachmentType.VIDEO : AttachmentType.IMAGE,
      publicId: f.filename || f.public_id || undefined
    }));
    const event = await prisma.event.create({
      data: {
        title, description, type,
        venue: venue ?? null,
        joinLink: joinLink ?? null,
        contactInfo: contactInfo ?? null,
        totalSeats: totalSeats ? Number(totalSeats) : null,
        requiresApproval: !!requiresApproval,
        joinQuestions: joinQuestions ? JSON.parse(joinQuestions) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        organizerId: Number(organizerId),
        companyId: Number(companyId),
        attachments: attachmentsData.length ? { create: attachmentsData } : undefined,
        status: status ?? "ACTIVE",         // ✅ added
        TypeOfEvent: TypeOfEvent,
      },
      include: { attachments: true, organizer: true }
    });

    return res.status(201).json(event);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      title,
      description,
      type,
      TypeOfEvent,
      venue,
      joinLink,
      contactInfo,
      totalSeats,
      requiresApproval,
      joinQuestions,
      startDate,
      endDate,
      companyId,
      organizerId,
      status,
      existingAttachments, // array of already saved attachments
    } = req.body as any;

    // Parse joinQuestions if it's a stringified array
    const parsedQuestions =
      typeof joinQuestions === "string" ? JSON.parse(joinQuestions) : joinQuestions;

    // ✅ Handle new uploads
    const files = req.files as Express.Multer.File[] | undefined;


    const newAttachments = (files || []).map((f: any) => ({
      url: f.path || f.url,
      type: f.mimetype?.startsWith("video") ? AttachmentType.VIDEO : AttachmentType.IMAGE,
      publicId: f.filename || f.public_id || undefined,
    }));

    // ✅ Merge existing + new
    const allAttachments = [
      ...(existingAttachments ? JSON.parse(existingAttachments) : []), // comes as JSON string from frontend
      ...newAttachments,
    ];

    // Prisma `update` can’t directly overwrite relation array, so:
    // -> delete old ones, then recreate
    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        type,
        TypeOfEvent,
        venue,
        joinLink: joinLink ?? null,
        contactInfo: contactInfo ?? null,
        totalSeats: totalSeats ? Number(totalSeats) : null,
        requiresApproval: !!requiresApproval,
        joinQuestions: parsedQuestions,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        organizerId: organizerId ? Number(organizerId) : undefined,
        companyId: companyId ? Number(companyId) : undefined,
        status: status ?? "ACTIVE",

        // 🔄 Replace attachments with merged list
        attachments: {
          deleteMany: {}, // clear old
          create: allAttachments,
        },
      },
      include: { attachments: true, organizer: true },
    });

    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};


export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // Optionally delete cloudinary assets by publicId before deleting DB rows.
    await prisma.event.delete({ where: { id } });
    return res.json({ message: "Event deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const listEvents = async (req: Request, res: Response) => {
  try {
    const {
      status = "active", // "ACTIVE" | "COMPLETED" | "CANCELLED" | "past" | "all"
      page = "1",
      pageSize = "10",
      search = ""
    } = req.query as any;

    const p = Math.max(1, parseInt(page));
    const ps = Math.min(50, Math.max(1, parseInt(pageSize)));

    const where: any = { AND: [] };

    // 🔎 Search filter
    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: String(search), mode: "insensitive" } },
          { description: { contains: String(search), mode: "insensitive" } }
        ]
      });
    }

    // 🎯 Status filtering
    switch (status.toLowerCase()) {
      case "active":
        where.AND.push({ status: "ACTIVE" });
        break;
      case "completed":
        where.AND.push({ status: "COMPLETED" });
        break;
      case "cancelled":
        where.AND.push({ status: "CANCELLED" });
        break;
      case "past":
        // past = completed only
        where.AND.push({ status: "COMPLETED" });
        break;
      case "all":
        // only ACTIVE, COMPLETED, CANCELLED
        where.AND.push({ status: { in: ["ACTIVE", "COMPLETED", "CANCELLED"] } });
        break;
      default:
        // fallback: only ACTIVE
        where.AND.push({ status: "ACTIVE" });
    }

    const [total, items] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { startDate: "asc" },
        skip: (p - 1) * ps,
        take: ps,
        include: {
          organizer: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
          attachments: true,
          _count: {
            select: {
              participants: { where: { status: "CONFIRMED" } }
            }
          },
        }
      })
    ]);

    return res.json({
      page: p,
      pageSize: ps,
      total,
      items: items.map((e) => ({
        ...e,
        confirmedParticipants: e._count.participants
      }))
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};


export const getEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const e = await prisma.event.findUnique({
      where: { id },
      include: { organizer: { select: { id: true, name: true } }, attachments: true,company:true, _count: { select: { participants: { where: { status: "CONFIRMED" } } } } }
    });
    if (!e) return res.status(404).json({ error: "Event not found" });
    return res.json({ ...e, confirmedParticipants: e._count.participants });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const joinEvent = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const { answers } = req.body as { answers?: any };
    const me = req.user!;
    const user = await prisma.user.findUnique({ where: { id: me.id }, include: { participantProfile: true } });
    if (!user || !user.participantProfile) return res.status(400).json({ error: "Participant profile required" });

    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { participants: { where: { status: "CONFIRMED" } } } } } });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.endDate < new Date()) return res.status(400).json({ error: "Event already finished" });

    const exists = await prisma.eventParticipant.findUnique({ where: { eventId_participantId: { eventId, participantId: user.participantProfile.id } } });
    if (exists) return res.status(409).json({ error: "Already joined" });

    const confirmedCount = event._count.participants;
    const seatsFull = event.totalSeats != null && confirmedCount >= event.totalSeats;
    if (!event.requiresApproval && seatsFull) return res.status(400).json({ error: "No seats available" });

    const status = event.requiresApproval ? "PENDING" : "CONFIRMED";
    const row = await prisma.eventParticipant.create({ data: { eventId, participantId: user.participantProfile.id, status, answers: answers ?? undefined } });

    return res.status(201).json(row);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const approveParticipant = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const partRowId = Number(req.params.pid);

    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { participants: { where: { status: "CONFIRMED" } } } } } });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.totalSeats != null && event._count.participants >= event.totalSeats) return res.status(400).json({ error: "No seats available" });

    const updated = await prisma.eventParticipant.update({ where: { id: partRowId }, data: { status: "CONFIRMED" } });
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

export const listParticipants = async (req: Request, res: Response) => {
  try {
    const eventId = Number(req.params.id);
    const list = await prisma.eventParticipant.findMany({ where: { eventId }, include: { participant: { include: { user: { select: { id: true, email: true } } } } } });
    return res.json(list);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
