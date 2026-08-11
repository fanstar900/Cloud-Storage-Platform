import prisma from "../config/database.js";
import {
    delete_file_from_storage
} from "./storage.service.js";

const create_file = async({
    owner_id,
    folder_id,
    original_name,
    stored_name,
    storage_path,
    mime_type,
    size
}) => {
    if(folder_id) {
        const folder = await prisma.folder.findFirst({
            where: {
                id: folder_id,
                ownerId: owner_id
            }
        });

        if(!folder){
            throw new Error("folder not found");
        }
    }

    return prisma.file.create({
        data: {
            name: stored_name,
            originalName: original_name,
            storagePath: storage_path,
            mimeType: mime_type,
            size,
            ownerId: owner_id,
            folderId: folder_id || null
        }
    });
};

const get_files = async(user_id, folder_id = null) =>{
    if(folder_id) {
        const folder = await prisma.folder.findFirst({
            where : {
                id: folder_id,
                ownerId: user_id
            },
            select: {
                id: true,
                name: true,
                parentId: true
            }
        });

        if(!folder) {
            throw new Error("folder not found");
        }
    }

    const files = await prisma.file.findMany({
        where: {
            ownerId: user_id,
            folderId: folder_id || null
        },
        orderBy: {
            name: "asc"
        },
        select: {
            id: true,
            name: true,
            originalName: true,
            mimeType: true,
            size: true,
            folderId: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return files;
};

const get_file_for_download = async(user_id, file_id) => {
    const file = await prisma.file.findFirst({
        where: {
            id: file_id,
            ownerId: user_id
        },
        select:{
            id: true,
            name: true,
            originalName: true,
            mimeType: true,
            size: true,
            storagePath: true
        }
    });

    if(!file) {
        throw new Error("file not found");
    }

    return file;
};

const delete_file = async(
    user_id,
    file_id
) => {

    const file = await prisma.file.findFirst({
        where: {
            id: file_id,
            ownerId: user_id
        },
        select: {
            id: true,
            storagePath: true
        }
    });

    if(!file){
        throw new Error("file not found");
    }

    await delete_file_from_storage(
        file.storagePath
    );

    await prisma.file.delete({
        where: {
            id: file.id
        }
    });

    return file.id;
};

export {
    create_file,
    get_files,
    get_file_for_download,
    delete_file
};