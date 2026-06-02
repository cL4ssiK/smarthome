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
                userId: user.userId,
                groupId: group.id,
                role: "owner",
             }
        });
        return group;
    }

    async getUsersGroups(user) {
        const data = await prisma.userGroup.findMany({
            where: { userId: user.id },
            include: {
                group: {
                    select: {
                        name: true
            }   }   }
        });
        return data.map(elem => ({
            userId: elem.userId,
            groupId: elem.groupId,
            role: elem.role,
            name: elem.group.name,
        }));
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