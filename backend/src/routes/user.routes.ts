import { Router } from "express";
import { listUsers, updateRole, deleteUser } from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), listUsers);
router.patch("/:id/role", requireAuth, requireRole("ADMIN"), updateRole);
router.delete("/:id", requireAuth, requireRole("ORGANIZER"), deleteUser);

export default router;
