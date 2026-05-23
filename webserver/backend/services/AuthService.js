import { Users } from "../users/Users.js";
import jwt from 'jsonwebtoken';
import pkg from 'jsonwebtoken';
const { JsonWebTokenError } = pkg;
import argon2 from 'argon2';


export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(401).json({message: "Token expired"});

        // Add the decoded user info to the request object
        req.user = user;
        next();
    });
}

export async function logOut(user) {
    await Users.removeRefreshToken(user?.userId);
}

export async function logIn(username, pswd) {
    if (!username || !pswd) throw new Error("Invalid credentials");
    
    const user = await Users.getUser(username);
    if (!user) throw new Error("Invalid credentials");
    
    const isValid = await argon2.verify(user.pswd, pswd);
    if (!isValid) throw new Error("Invalid credentials");

    const token = jwt.sign(
        { userId: user.id, username:user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
    );

    const refreshToken = jwt.sign(
        { userId: user.id, username:user.username, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
    );

    await Users.updateRefreshToken(user.id, refreshToken);

    return { token: token, refreshtoken: refreshToken, user: { id: user.id, username: user.username, role: user.role } };
}

export async function register(username, pswd) {
    let errorMsg = "";    
    if (!username || !pswd) errorMsg = "Password or username missing.";
    
    try {
        await Users.newUser(username, pswd);
    } catch (e){
        errorMsg = "Username already taken."
    }
    return { error: errorMsg };
}


export async function renewToken(token) {
    let userD;

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) throw new JsonWebTokenError();
        // Add the decoded user info to the request object
        userD = user;
    });

    if(!(await Users.validateRefreshToken(userD?.userId, token))) throw new JsonWebTokenError();

    const newtoken = jwt.sign(
        { userId: userD.userId, username: userD.username, role: userD.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
    );

    return {
      token: newtoken,
      user: { userId: userD.userId, username: userD.username, role: userD.role }
    };
}
