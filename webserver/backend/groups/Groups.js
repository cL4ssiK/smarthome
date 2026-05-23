import prisma from "../database/prisma.js";

export class Groups {
    constructor() {
        this.db = prisma;
    }

    async newGroup(name, user) {
        const group = await prisma.group.create({
            data: { name: name }
        });
        await prisma.userGroup.create({
            data: { 
                userId: user.id,
                groupId: group.id,
                role: "owner",
             }
        });
        return group;
    }

    async getUsersGroups(user) {
        return await prisma.userGroup.findMany({
            where: { userId: user.id },
            include: {
                group: true // This fetches the full Group object, not just the ID
            }
        });
    }
    
    async getDevicesInGroup(group) {
        return await prisma.device.findMany({
            where: { groupId: group.id }
        });
    }
    
    async addDeviceToGroup(device, group) {
        await prisma.device.update({
            where: { id: device.id },
            data: { groupId: group.id }
        });
    }
    
    async addUserToGroup(user, group) {
        await prisma.userGroup.create({
            data: {
                userId: user.id,
                groupId: group.id
            }
        });
    }
}