import multer from "multer";
import path from "path";
import {v4 as uuidv4} from "uuid";

import {get_user_upload_directory} from "../services/storage.service.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const directory = get_user_upload_directory(req.user.id);
        cb(null, directory) ;
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const filename = `${uuidv4()}${extension}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 10 MB
    }
});

export default upload;