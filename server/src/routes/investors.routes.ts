import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody, validateQuery } from "../middleware/validate";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import {
  createInvestorSchema,
  listInvestorsQuerySchema,
  updateInvestorSchema,
} from "../types/investor.schema";
import {
  createInvestor,
  deleteInvestor,
  getInvestorByIdOrSlug,
  listInvestors,
  updateInvestor,
} from "../controllers/investors.controller";

const router = Router();

router.get("/", validateQuery(listInvestorsQuerySchema), asyncHandler(listInvestors));
router.get("/:idOrSlug", asyncHandler(getInvestorByIdOrSlug));
router.post("/", apiKeyAuth, validateBody(createInvestorSchema), asyncHandler(createInvestor));
router.patch("/:id", apiKeyAuth, validateBody(updateInvestorSchema), asyncHandler(updateInvestor));
router.delete("/:id", apiKeyAuth, asyncHandler(deleteInvestor));

export default router;
