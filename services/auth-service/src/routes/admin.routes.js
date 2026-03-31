import express from "express";
import { getAllUsersController } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/users", protect, authorize("admin"), getAllUsersController);

export default router;