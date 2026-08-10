import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import {
    search
} from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", authenticate, search);

export default router;