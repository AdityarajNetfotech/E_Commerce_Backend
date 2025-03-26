import express from "express";
import { googleSignin } from "../controllers/GoogleController.js";

const router = express.Router();

router.post('/google-signin', googleSignin)

export default router;