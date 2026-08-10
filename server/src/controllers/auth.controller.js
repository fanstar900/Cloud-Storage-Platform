import { register_user, login_user } from "../services/auth.service.js";
import { generate_token } from "../utils/jwt.js";

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const user = await register_user(
            name,
            email,
            password
        );

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        if (error.message === "User already exists") {
            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const login = async(req, res) =>{
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await login_user(email, password);

        const token = generate_token(user.id);

        res.status(200).json({
            message: "Login successful",
            token,
            user
        });
    } catch (error){
        if(error.message === "Invalid email or password"){
            return res.status(401).json({
                message: error.message
            }) ;
        }

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }   
}

export {
    register,
    login
};