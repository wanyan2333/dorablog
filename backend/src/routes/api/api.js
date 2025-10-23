import express from "express";

const router = express.Router();


// import child routes
import authRoutes from "./auth.js";
router.use("/", authRoutes);

// import tempRoutes from "./api-temp.js";
// router.use("/messages", tempRoutes);

export default router;
