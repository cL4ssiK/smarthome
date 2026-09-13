import { Groups } from "./groups/Groups.js";
import { Devices } from "./devices/Devices.js";
import { Users } from "./users/Users.js";
import { Device } from "./devices/Device.js";

export class AssetManager {

    constructor() {
        this.devices = new Devices();
        this.groups = new Groups();
        this.users = new Users();
    }

    /**
     * Functions for handling devices.
     */

    /**
     * Register new device to database.
     * @param {Object} data 
     * @returns boolean
     */
    async registerNewDevice(data) {
        try {
            const deviceId = data?.device_id;
            const name = data?.name ? data.name : "";
            const type = data?.payload?.devicetype ? data.payload.devicetype : "";

            const device = Device.newDevice({
                deviceId: deviceId,
                name: name,
                type: type,
            });
            console.log("moi");
            await device.save();
        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    /**
     * Creates device object into server memory based on functions provided by physical device and information stored on database.
     * @param {Object} data 
     * @param {WebSocket} ws 
     * @returns boolean
     */
    async activateDevice(data, ws) {
        try {
            const deviceId = data?.device_id;
            const functions = data?.payload?.functions;
            const device = await this.devices.findFromDb(deviceId);

            device.addFunctions(functions);
            device.connect(ws);

            this.devices.add(device);
        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    /**
     * Carrier for changing functions state on device
     * @param {Object} data 
     * @returns 
     */
    changeFunctionState(data) {
        try {
            this.devices.changeFunctionState({
                deviceId: data?.device_id,
                state: data?.payload?.state,
                code: data?.func_code,
            });

        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    /**
     * Close websocket connection and remove device from server memory.
     * @param {WebSocket} connection 
     */
    disconnectDevice(connection) {
        const device = this.devices.findByConnection(connection);
        if(device) {
            this.devices.disconnect(device);
            console.log(device.device_id + " disconnected.");
        }
    }

    /**
     * Carrier for sending command to device.
     * @param {Object} data {id, code}
     */
    sendCommand(data) {
        this.devices.sendCommand(data?.id, data?.code);
    }

    /**
     * Carrier for setting timer on function activation.
     * @param {Object} data 
     */
    sendTimedCommand(data) {
        //TODO: validate data
        this.devices.sendTimedCommand({
            deviceId: data?.id,
            code: data?.code,
            time: data?.time,
            timeS: data?.timeS,
            type: data?.type,
        });
    }

    /**
     * Carrier for removing set timed function activation.
     * @param {Object} data 
     */
    removeTimedCommand(data) {
        this.devices.removeTimedCommand(data?.id, data?.code, data?.type);
    }

    /**
     * Disconnects device and removes it from database. 
     * @param {Object} data 
     */
    removeDevice(data) {
        this.devices.remove(data?.id);
        console.log("Device " + data?.id + " removed.");
    }

    /**
     * Carrier for renaming device.
     * @param {Object} data 
     */
    async renameDevice(data) {
        await this.devices.renameDevice(data?.id, data?.name);
    }

    async createNewGroup(data) {
        const user = data.user;
        const name = data.group.name;
        return await this.groups.newGroup(name, user);
    }


    async addNewUserToGroup(data) {
        const user = data.user;
        //TODO: FIX THE MISMATCH BETWEEN DB USER AND FRONTEND USER!
        user.id = user.userId;
        delete user.userId;

        const groupId = data.groupId;
        const addUser =  data.addUser;

        if (!user || !groupId || !addUser) return 'Nullish input field.';

        const usersRole = await this.groups.getUsersRoleInGroup(user, groupId);

        if (usersRole !== "owner") return 'User does not have permission to perform this operation.';

        const newUser = await Users.getUser(addUser);

        if (!newUser) return 'User ' + addUser + ' does not exist.' 

        const success = this.groups.addUserToGroup(newUser.id, groupId, 'user');

        return success;
    }

    //TODO: removedUserRole ja UserRole samaan hakuun.
    async removeUserFromGroup(data) {
        const user = data.user;
        //TODO: FIX THE MISMATCH BETWEEN DB USER AND FRONTEND USER!
        user.id = user.userId;
        delete user.userId;
        
        const groupId = data.groupId;
        const rmUser =  data.rmUser;

        if (!user || !groupId || !rmUser) return 'Nullish input field.';

        const usersRole = await this.groups.getUsersRoleInGroup(user, groupId);
        const removedUser = await Users.getUser(rmUser);
        
        if (!(usersRole === "owner" || user.id === removedUser.id)) return 'User does not have permission to perform this operation.';
        
        if (!removedUser) return 'User ' + rmUser + ' does not exist.' 
        
        const removedUsersRole = await this.groups.getUsersRoleInGroup(removedUser, groupId);
        
        const success = this.groups.removeUserFromGroup(removedUser.id, groupId, removedUsersRole);

        return success;
    }

    /**
     * Function for requesting all devices formatted for frontend.
     * @returns array of Device objects in slightly differend format.
     */
    async getAllInFrontendFormat() {
        return await this.devices.getAllInFrontendFormat();
    }

    async getUsersGroupsAndDevices(data) {
        const user = data?.user;
        const groups = await this.groups.getUsersGroups(user);
        const devices = {};

        for (const group of groups) {
            const d = await this.devices.getGroupDevicesInFrontendFormat(group);
            if (d.length > 0) devices[group.groupId] = d;
        }

        return {
            groups: groups,
            devices: devices
        };
    }
}
