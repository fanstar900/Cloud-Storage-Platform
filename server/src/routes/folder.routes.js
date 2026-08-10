import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {create, get_root, get_contents} from "../controllers/folder.controller.js";

const router = express.Router();

router.post("/", authenticate, create);
router.get("/", authenticate, get_root);
router.get("/:folder_id", authenticate, get_contents);

export default router;