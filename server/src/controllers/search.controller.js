import {
    search_storage
} from "../services/search.service.js";

const search = async(req, res) => {
    try {
        const query = req.query.q;

        if(!query || !query.trim()) {
            return res.status(400).json({
                message: "Search query is required"
            })
        }

        const results = await search_storage(
            req.user.id,
            query
        );

        res.status(200).json(results);
    } catch (error) {
        console.error(error) ;
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export {
    search
};