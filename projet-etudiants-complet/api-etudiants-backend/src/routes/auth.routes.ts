import { Router } from "express";
import { inscrire, connecter } from "../controllers/auth.controller";

const router = Router();

router.post("/register", inscrire); // POST /auth/register
router.post("/login", connecter);   // POST /auth/login

export default router;
