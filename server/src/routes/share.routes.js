import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
    create_share,
    get_shared_file_info,
    download_shared_file
} 
from "../controllers/share.controller.js";

const router = express.Router();

router.post("/files/:file_id/share", authenticate, create_share);
router.get("/share/:token", get_shared_file_info);
router.get("/share/:token/download", download_shared_file);

export default router;

