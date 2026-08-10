import bcrypt from "bcrypt";
import prisma from "../config/database.js";

const register_user = async(name, email, password) => {
    const existing_user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if(existing_user) {
        throw new Error("User already exists") ;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: password_hash
        },
        select:{
            id: true,
            name: true,
            email:true,
            createdAt: true
        }
    });

    return user ;
}

const login_user = async(email, password)=>{
    const user  = await prisma.user.findUnique({
        where: {
            email: email
        }
    });
    
    if(!user){
        throw new Error("Invalid email or password");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
}

export {
    register_user,
    login_user
};