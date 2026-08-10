import {
    create_folder,
    get_root_contents,
    get_folder_contents
} from "../services/folder.service.js";

const create = async (req, res) =>{
    try {
        const { name, parent_id } = req.body;

        if(!name || !name.trim()){
            return res.status(400).json({
                message: "Folder name is required"
            });
        }

        const folder = await create_folder(
            req.user.id, // comes from JWT middleware
            name.trim(),
            parent_id || null
        );

        res.status(201).json({
            message: "Folder created successfully",
            folder
        });

    } catch(error) {
        if(error.message === "Parent folder not found"){
            return res.status(404).json({
                message: error.message
            });
        }

        if(error.message === "Folder already exists"){
            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const get_root = async(req, res) => {
    try {
        const folders = await get_root_contents(req.user.id);

        res.status(200).json({
            message: "Root folders fetched successfully",
            folders
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const get_contents = async(req, res) => {
    try {
        const {folder_id} = req.params;

        const contents = await get_folder_contents(req.user.id, folder_id);

        res.status(200).json({
            message: "Folder contents fetched successfully",
            contents
        });
    } catch(error) {
        if(error.message === "Folder not found"){
            return res.status(404).json({
                message: error.message
            });
        }

        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export {
    create,
    get_root,
    get_contents
};
