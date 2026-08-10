import crypto from "crypto";
import prisma from "../config/database.js";
import fs from "fs";

const hash_token = (token)=> {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const create_share_link = async(
    user_id,
    file_id,
    expires_in_days,
    max_downloads
) => {
    const file = await prisma.file.findFirst({
        where: {
            id: file_id,
            ownerId: user_id
        }
    });

    if(!file){
        throw new Error("File not found");
    }

    const token = crypto
        .randomBytes(32)
        .toString("hex");

    const token_hash = hash_token(token);

    let expires_at = null;

    if(expires_in_days) {
        expires_at = new Date();

        expires_at.setDate(
            expires_at.getDate() + 
            Number(expires_in_days)
        );
    }

    await prisma.shareLink.create({
        data: {
            tokenHash: token_hash,
            fileId: file_id,
            expiresAt: expires_at,
            maxDownloads: max_downloads || null
        }
    });

    return token;
};

const get_shared_file = async(token) => {
    const token_hash = hash_token(token);

    const share_link = await prisma.shareLink.findUnique({
        where: {
            tokenHash: token_hash
        },
        include: {
            file: true
        }
    });

    if(!share_link){
        throw new Error("Share link not found");
    }

    if(
        share_link.expiresAt && 
        share_link.expiresAt <= new Date()
    ) {
        throw new Error("Share link expired");
    }

    if(
        share_link.maxDownloads !== null && 
        share_link.downloadCount >= share_link.maxDownloads
    ){
        throw new Error("Download limit reached");
    }

    if(!fs.existsSync(share_link.file.storagePath)){
        throw new Error("File not found on storage");
    }

    if(share_link.maxDownloads !== null) {
        const updated = await prisma.shareLink.updateMany({
            where: {
                id: share_link.id,
                downloadCount: {
                    lt: share_link.maxDownloads
                }
            },
            data: {
                downloadCount: {
                    increment: 1
                }
            }
        });

        if(updated.count === 0) {
            throw new Error("Download limit reached");
        }
    }else {
        await prisma.shareLink.update({
            where: {
                id: share_link.id
            },
            data: {
                downloadCount: {
                    increment: 1
                }
            }
        });        
    }



    return share_link.file;
};

export {
    create_share_link,
    get_shared_file,
    hash_token
};