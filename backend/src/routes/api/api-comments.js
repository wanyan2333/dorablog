import express from "express";
import { requiresAdmin, requiresAuthentication } from "../../middleware/auth-middleware.js";

const router = express.Router();

export default router;