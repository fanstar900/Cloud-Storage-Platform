import { create_file, get_files, get_file_for_download, delete_file } from "../services/file.service.js";
import {
    upload_file_to_storage, get_download_url,
} from "../services/storage.service.js";
import fs from "fs";

const upload_file = async (req, res) => {

    try {

        if(!req.file){
            return res.status(400).json({
                message: "File required"
            });
        }

        const storage_path =
            await upload_file_to_storage(
                req.user.id,
                req.file
            );

        const file = await create_file({
            owner_id: req.user.id,
            folder_id: req.body.folder_id || null,
            original_name: req.file.originalname,
            stored_name: req.file.originalname,
            storage_path,
            mime_type: req.file.mimetype,
            size: req.file.size
        });

        res.status(201).json({
            message: "File uploaded successfully",
            file
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const list_files = async(req, res) => {
    try {
        const folder_id = req.query.folder_id || null;

        const files = await get_files(req.user.id, folder_id);

        res.status(200).json({
            files
        });
    } catch(error) {
        if(error.message === "folder not found") {
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

const download_file = async(
    req,
    res
) => {

    try {

        const file =
            await get_file_for_download(
                req.user.id,
                req.params.file_id
            );

        const url =
            await get_download_url(
                file.storagePath
            );

        res.status(200).json({
            url
        });

    } catch(error) {

        if(error.message === "file not found"){
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

const remove_file = async(req, res) => {
    try {
        await delete_file(
            req.user.id,
            req.params.file_id
        );

        res.status(200).json({
            message: "File deleted successfully"
        });
    } catch (error) {
        if(error.message === "file not found") {
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
    upload_file,
    list_files,
    download_file,
    remove_file
};
