import fs from "fs";

import {
    create_share_link,
    get_shared_file
} from "../services/share.service.js";

const create_share = async(req, res) => {
    try {
        const token = await create_share_link(
            req.user.id,
            req.params.file_id,
            req.body.expires_in_days,
            req.body.max_downloads
        );

        res.status(201).json({
            share_url: 
                `http://localhost:5000/api/share/${token}`
        });
    } catch(error) {
        if(error.message === "File not found"){
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

const download_shared_file = async(req, res) =>{
    try{
        const file = await get_shared_file(
            req.params.token
        );

        res.setHeader(
            "Content-Type",
            file.mimeType
        );

        res.setHeader(
            "Content-Length",
            file.size
        )

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${file.originalName}"`
        );

        const stream = fs.createReadStream(
            file.storagePath
        );

        stream.on("error", (error) => {
            console.error(error);

            if(!res.headersSent) {
                res.status(500).json({
                    message: "Failed to read file"
                });
            }else{
                res.destroy(error);
            }
        });

        stream.pipe(res);
    } catch(error){
        if(error.message === "Shared file not found" ||
            error.message === "Shared file has expired" ||
            error.message === "Download limit reached" ||
            error.message === "File not found on storage"
        ){
            return res.status(404).json({
                message: error.message
            });
        }

        console.error(error);
        res.status(500).json({  
            message: "Internal server error"    
        }) ;
    }
}

export {
    create_share,
    download_shared_file
};