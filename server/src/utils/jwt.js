import jwt from "jsonwebtoken";

const generate_token = (user_id) =>{
    return jwt.sign(
        {
            user_id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

const verify_token = (token)=>{
    return jwt.verify (token, process.env.JWT_SECRET);
};

export{
    generate_token,
    verify_token
}