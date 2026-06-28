import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody, validateQuery } from "../middleware/validate";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import {
  createCompanySchema,
  listCompaniesQuerySchema,
  updateCompanySchema,
} from "../types/company.schema";
import {
  createCompany,
  deleteCompany,
  getCompanyByIdOrSlug,
  listCompanies,
  updateCompany,
} from "../controllers/companies.controller";

const router = Router();

router.get("/", validateQuery(listCompaniesQuerySchema), asyncHandler(listCompanies));
router.get("/:idOrSlug", asyncHandler(getCompanyByIdOrSlug));
router.post("/", apiKeyAuth, validateBody(createCompanySchema), asyncHandler(createCompany));
router.patch("/:id", apiKeyAuth, validateBody(updateCompanySchema), asyncHandler(updateCompany));
router.delete("/:id", apiKeyAuth, asyncHandler(deleteCompany));

export default router;
