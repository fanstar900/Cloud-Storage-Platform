import {
    create_share_link,
    get_shared_file
} from "../services/share.service.js";
import {
    get_download_url
} from "../services/storage.service.js";

// Must match the messages thrown by get_shared_file in share.service.js
const SHARE_ERRORS = [
    "Share link not found",
    "Share link expired",
    "Download limit reached"
];

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
             `${process.env.CLIENT_URL}/share/${token}`
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

const download_shared_file = async (req, res) => {
    try {

        const file = await get_shared_file(
            req.params.token,
            { consume: true }
        );

        const url = await get_download_url(
            file.storagePath
        );

        res.status(200).json({
            url
        });

    } catch(error) {

        if(SHARE_ERRORS.includes(error.message)){
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

const get_shared_file_info = async(req, res) => {
    try {

        const file = await get_shared_file(
            req.params.token
        );

        res.status(200).json({
            id: file.id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            createdAt: file.createdAt
        });

    } catch(error) {

        if(SHARE_ERRORS.includes(error.message)){
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
    create_share,
    download_shared_file,
    get_shared_file_info
};