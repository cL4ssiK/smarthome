import prisma from "../database/prisma.js";
import argon2 from "argon2";

//TODO: Make cache object inside users object, so we can store some users locally.

export class Users {
    constructor() {
        this.db = prisma;
    }

    static async hashPassword(pswd) {
        return await argon2.hash(pswd);
    }

    static async newUser(username, pswd) {
        let user = await prisma.user.findUnique({
            where: { username: username }
        });
        
        if (user) throw new Error("Username is taken!");

        user = await prisma.user.create({
            data: {
                username: username,
                pswd: await Users.hashPassword(pswd),
                role: "user",
            }
        });

        return {
            id: user.id,
            username: user.username,
            role: user.role,
        };
    }

    static async getUser(username) {
        return await prisma.user.findUnique({
            where: { username: username }
        });
    }

    static async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id: id }
        });
    }

    static async updateRefreshToken(userId, token) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshtoken: await this.hashPassword(token) },
        });
    }

    static async validateRefreshToken(userId, token) {
        try {
            const { refreshtoken } = await prisma.user.findUnique({
                where: { id: userId },
                select: { refreshtoken: true },
            });

            if (!refreshtoken) return false;
            
            return await argon2.verify(refreshtoken, token);
        } catch(err) {
            return false;
        }
    }

    static async removeRefreshToken(userId) {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: { refreshtoken: null }
            });
        } catch(err) {
            throw err;
        }
    }


}