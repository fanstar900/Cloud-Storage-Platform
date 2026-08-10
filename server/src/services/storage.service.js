import fs from "fs";
import path from "path";

const ensure_directory_exists = (directory_path) => {
    if(!fs.existsSync(directory_path)) { 
        fs.mkdirSync(directory_path,{
            recursive: true
        });
    }
};

const get_user_upload_directory = (user_id) => {
    const directory_path = path.join(
        process.cwd(),
        "uploads",
        user_id
    );
    ensure_directory_exists(directory_path);
    return directory_path;
};

export {
    get_user_upload_directory
};