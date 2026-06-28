import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getOverviewStats } from "../controllers/stats.controller";

const router = Router();

router.get("/overview", asyncHandler(getOverviewStats));

export default router;
