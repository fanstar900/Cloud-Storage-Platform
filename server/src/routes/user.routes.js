import express from "express";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, (req, res) => {
    res.json({
        message: "Authentication successful",
        user_id: req.user.id
    });
});

export default router;