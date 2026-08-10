import express from "express";

import authenticate from "../middleware/auth.middleware.js";

import upload from "../config/multer.js";

import {upload_file, list_files, download_file, remove_file} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), upload_file);
router.get('/', authenticate, list_files);
router.get('/:file_id/download', authenticate, download_file);
router.delete('/:file_id', authenticate, remove_file);

export default router;