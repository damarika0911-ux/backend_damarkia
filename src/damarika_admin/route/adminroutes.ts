import express from "express";
import { adminHealthCheck, signup } from "../controllers/auth/loginandsignup";

const router = express.Router();
router.post("/signup", signup);
router.get("/", adminHealthCheck);

export default router;
