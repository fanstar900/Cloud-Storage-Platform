import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
    create_share,
    download_shared_file
} 
from "../controllers/share.controller.js";

const router = express.Router();

router.post("/files/:file_id/share", authenticate, create_share);
router.get("/share/:token", download_shared_file);

export default router;

