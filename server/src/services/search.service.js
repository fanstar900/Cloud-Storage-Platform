import prisma from "../config/database.js";

const search_storage = async(user_id, query) => {
    const search_query = query.trim();

    if(!search_query) {
        return {
            folders: [],
            files: []
        };
    }
     
    const [folders, files] = await Promise.all([
        prisma.folder.findMany({
            where: {
                ownerId: user_id,
                name: {
                    contains: search_query,
                    mode: "insensitive"
                }
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
        }),

        prisma.file.findMany({
            where: {
                ownerId: user_id,
                originalName: {
                    contains: search_query,
                    mode: "insensitive"
                }
            },
            orderBy: {
                originalName: "asc"
            },
            select: {
                id: true,
                name: true,
                originalName: true,
                mimeType: true,
                size: true,
                folderId: true,
                createdAt: true,
            }
        })
    ]);

    return {
        folders,
        files
    };
        
};

export {
    search_storage
}