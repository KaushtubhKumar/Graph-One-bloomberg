/**
 * app.ts — single source of truth for route wiring.
 *
 * Mount order matters: the *Extended routers define sub-paths like
 * /companies/trending and /companies/:slug/funding. They must be mounted
 * BEFORE the base companies/investors routers, otherwise Express matches
 * /companies/:idOrSlug first and "trending" gets treated as a slug.
 */

import express from "express";
import cors from "cors";
import compression from "compression";

import { env } from "./utils/env";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Core entity routers
import companiesRouter from "./routes/companies.routes";
import investorsRouter from "./routes/investors.routes";
import fundingRoundsRouter from "./routes/fundingRounds.routes";
import statsRouter from "./routes/stats.routes";

// Extended sub-routes (trending, graph, funding timeline, most-active, etc.)
import companiesExtendedRouter from "./routes/companiesExtended";
import investorsExtendedRouter from "./routes/investorsExtended";

// New entities
import foundersRouter from "./routes/founders";
import productsRouter from "./routes/products";
import newsRouter from "./routes/news";

// Utility routers
import searchRouter from "./routes/search";
import feedRouter from "./routes/feed";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((o) => o.trim()),
  })
);
app.use(compression());
app.use(express.json());

// Rate limit: 100 req/min per IP, applied globally before any route logic.
app.use(rateLimiter);

app.get("/", (_req, res) => res.send("GraphOne API is live and running!"));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Extended sub-routes BEFORE base routers (see note above) ────────────────
app.use("/api/companies", companiesExtendedRouter);
app.use("/api/investors", investorsExtendedRouter);

// ── Core entity routers ──────────────────────────────────────────────────────
app.use("/api/companies", companiesRouter);
app.use("/api/investors", investorsRouter);
app.use("/api/funding-rounds", fundingRoundsRouter);

// ── New entity routers ────────────────────────────────────────────────────────
app.use("/api/founders", foundersRouter);
app.use("/api/products", productsRouter);
app.use("/api/news", newsRouter);

// ── Utility routers ───────────────────────────────────────────────────────────
app.use("/api/search", searchRouter);
app.use("/api/feed", feedRouter);
app.use("/api/stats", statsRouter);

// ── 404 + global error handler (must be last) ────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
