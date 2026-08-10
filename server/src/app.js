import express from "express";
import cors from "cors";
import "dotenv/config";

import {connect_redis} from "./config/redis.js";

import auth_routes from "./routes/auth.routes.js";
import user_routes from "./routes/user.routes.js";
import folder_routes from "./routes/folder.routes.js";
import file_routes from "./routes/file.routes.js";
import share_routes from "./routes/share.routes.js";
import search_routes from "./routes/search.routes.js";

const app = express();

console.log(process.env.CLIENT_URL);
app.use(
    cors({
        origin: process.env.CLIENT_URL
    })
);
app.use(express.json());

app.use("/api/auth", auth_routes);
app.use("/api/users", user_routes);
app.use("/api/folders", folder_routes);
app.use("/api/files", file_routes);
app.use('/api', share_routes);
app.use("/api/search", search_routes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Cloud Storage API is running"
    });
});

const port = process.env.PORT || 5000;

const start_server = async()=>{
    try {
        await connect_redis();

        app.listen(port, ()=>{
            console.log(`Server is running on port ${port}`);
        });

    }catch(error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

start_server();