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
        const groups = await prisma.group.findMany({
            where: {
                users: {
                    some: {
                        userId: user.userId
                    }
                }
            },
            include: {
                users: { 
                    include: {
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                }
            }
        });
        return groups.map(elem => ({
            groupId: elem.id,
            name: elem.name,
            owner: elem.users.find(u => u.role === "owner")?.user?.username ?? null,
            users: elem.users.map(elem2 => ({
                username: elem2.user.username,
                role: elem2.role 
            }))
        }));
    }

    async getUsersRoleInGroup(user, groupId) {
        return (await prisma.userGroup.findUnique({
            where: {
                    userId_groupId: {
                        userId: Number(user.id),
                        groupId: Number(groupId),
                    },
                }
        }))?.role;
    }
    
    async getUserGroup(groupId) {
        return await prisma.userGroup.findFirst({
            where: {groupId : groupId}
        });
    }
    
    async addDeviceToGroup(device, group) {
        await prisma.device.update({
            where: { id: device.id },
            data: { groupId: group.id }
        });
    }
    
    async addUserToGroup(userId, groupId, role) {
        let errorMsg = '';
        try {
            await prisma.userGroup.create({
                data: {
                    userId: userId,
                    groupId: groupId,
                    role: role
                }
            });
        } catch (error){
            errorMsg = 'Failure in creating new UserGroup.'
        }
        return errorMsg;
    }

    async removeUserFromGroup(userId, groupId, role) {
        let errorMsg = '';

        try {
            await prisma.userGroup.delete({
                where: {
                    userId_groupId: {
                        userId: Number(userId),
                        groupId: Number(groupId),
                    },
                }
            });
        } catch (error){
            errorMsg = 'Failure in deleting UserGroup.'
        }

        const anyUsersInGroup = await prisma.userGroup.findFirst({
            where: {
                groupId: Number(groupId),
            }
        });

        if (!anyUsersInGroup || role === 'owner') {
            try {
                await prisma.group.delete({
                    where: {
                        id: Number(groupId)
                    }
                })
            } catch (error) {
                errorMsg = 'Failure in deleting empty group.'
            }
        }
        return errorMsg;
    }
}