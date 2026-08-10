import {verify_token} from "../utils/jwt.js";

const authenticate = (req, res, next) => {
    try{
        const authorization = req.headers.authorization;

        if(!authorization){
            return res.status(401).json({
                message: "Authorization header is missing"
            });
        }

        const parts = authorization.split(" ");

        if(
            parts.length !== 2 || 
            parts[0] !== "Bearer" 
        ) {
            return res.status(401).json({
                message: "Invalid authorization header format"
            });
        }

        const token = parts[1];

        const payload = verify_token(token);

        req.user = {
            id: payload.user_id
        };

        next();
    } catch(error){
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default authenticate ;