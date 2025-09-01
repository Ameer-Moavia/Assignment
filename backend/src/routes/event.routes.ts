import { Router } from "express";
import {
  createEvent, updateEvent, deleteEvent, listEvents, getEvent,
  joinEvent, approveParticipant, listParticipants
} from "../controllers/event.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import upload from "../middleware/upload";

const router = Router();

// Public
router.get("/", listEvents);
router.get("/:id", getEvent);

// Admin/Organizer
router.post("/", requireAuth, requireRole("ADMIN", "ORGANIZER"), upload.array("files", 6), createEvent);
router.patch("/:id", requireAuth, requireRole("ADMIN", "ORGANIZER"), upload.array("files", 6), updateEvent);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteEvent);
router.get("/:id/participants", requireAuth, requireRole("ADMIN", "ORGANIZER"), listParticipants);
router.post("/:id/participants/:pid/approve", requireAuth, requireRole("ADMIN", "ORGANIZER"), approveParticipant);

// Participant
router.post("/:id/join", requireAuth, joinEvent);

export default router;