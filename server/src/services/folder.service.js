// POST   /api/folders
// GET    /api/folders
// GET    /api/folders/:id
// DELETE /api/folders/:id


import prisma from "../config/database.js";
import { get_cache, set_cache, delete_cache } from "./cache.service.js";

const create_folder = async(user_id, name, parent_id = null) => {
    if(parent_id){
        const parent_folder = await prisma.folder.findFirst({
            where: {
                id: parent_id,
                ownerId: user_id
            }
        });

        if(!parent_folder){
            throw new Error("Parent folder not found");
        }
    }

    const existing_folder = await prisma.folder.findFirst({
        where: {
            name,
            ownerId: user_id,
            parentId: parent_id
        }
    });

    if(existing_folder) {
        throw new Error("Folder already exists");
    }

    const folder = await prisma.folder.create({
        data: {
            name,
            ownerId: user_id,
            parentId: parent_id
        },
        select: {
            id: true,
            name: true,
            parentId: true,
            createdAt: true
        }
    });

    const cache_key = `folders:${user_id}:${parent_id || "root"}`;

    await delete_cache(cache_key);

    return folder ;
};

const get_root_contents = async(user_id) => {


    const cache_key = `folders:${user_id}:root`;

    const cached = await get_cache(cache_key);

    if(cached){
        console.log("Redis cache hit:", cache_key);
        return JSON.parse(cached);
    }

    console.log("Redis cache miss:", cache_key);

    const folders = await prisma.folder.findMany({
        where: {
            ownerId: user_id,
            parentId: null
        },
        orderBy: {
            name: "asc"
        },
        select: {
            id: true,
            name: true,
            parentId: true,
            createdAt: true
        }
    });

    await set_cache(
        cache_key,
        JSON.stringify(folders),
    );

    return folders;
};

const get_folder_contents = async(user_id, folder_id) => {

    const cache_key = `folders:${user_id}:${folder_id}`;

    const cached = await get_cache(cache_key);

    if(cached){
        console.log("Redis cache hit:", cache_key);
        return JSON.parse(cached);
    }

    console.log("Redis cache miss:", cache_key);


    const folder = await prisma.folder.findFirst({
        where: {
            id: folder_id,
            ownerId: user_id
        }
    });

    if(!folder) {
        throw new Error("Folder not found");
    }

    const folders = await prisma.folder.findMany({
        where: {
            ownerId: user_id,
            parentId: folder_id
        },
        orderBy: {
            name: "asc"
        },
        select: {
            id: true,
            name: true,
            parentId: true,
            createdAt: true
        }
    });

    const breadcrumb_path = await get_breadcrumb_path(user_id, folder_id);
    const result = {
        folder,
        folders,
        breadcrumbPath: breadcrumb_path
    };

    await set_cache(
        cache_key,
        JSON.stringify(result),
    );

    return result;  
}

const get_breadcrumb_path = async(user_id, folder_id) => {
    const folders = await prisma.folder.findMany({
        where: {
            ownerId: user_id
        },
        select: {
            id: true,
            name: true,
            parentId: true
        }
    });

    const folder_map = new Map(
        folders.map((folder) => [folder.id, folder])
    );

    const path = [];
    let current_id = folder_id;

    while(current_id) {
        const folder = folder_map.get(current_id);

        if(!folder) {
            break;
        }

        path.unshift({
            id: folder.id,
            name: folder.name
        });

        current_id = folder.parentId;
    }

    return path;
};

export {
    create_folder,
    get_root_contents,
    get_folder_contents,
    get_breadcrumb_path
};