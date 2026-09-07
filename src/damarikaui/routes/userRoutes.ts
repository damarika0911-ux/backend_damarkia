import express from "express";
import { getUsers, testUser } from "../controllers/userController";


const router = express.Router();
router.get("/", getUsers);
router.post('/:id', testUser);

export default router;
