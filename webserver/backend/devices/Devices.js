import { Device } from "./Device.js";
import prisma from '../database/prisma.js';

class Devices {
    constructor() {
        this.known_devices = new Map();
    }

    async fetchDevicesFromDb() {
        const devices = await prisma.device.findMany();
        devices.forEach(device => {
            const d = Device.deviceFromDatabase(device);
            this.add(d);
        });
    }

    size() {
        return this.known_devices.size;
    }

    add(device) {
        if (!(device instanceof Device)) return;
        this.known_devices.set(device.device_id, device);
    }

    /**
     * Removes device from database and server memory permanently.
     * @param {String} id 
     */
    async remove(id) {
        const device = await this.findById(id);
        device?.disconnect();
        device.delete();
        this.known_devices.delete(id);
    }

    /**
     * Removes device from server memory, since only ones with ws connection need to be there.
     * @param {Device} id 
     */
    disconnect(device) {
        const deviceId = device.device_id;
        device.disconnect();
        this.known_devices.delete(deviceId);
        console.log(deviceId + " disconnected!");
    }

    /**
     * Finds device from server memory or database based on device id.
     * @param {String} id 
     * @returns Found device, null if not found.
     */
    async findById(id) {
        let device = this.known_devices.get(id);
        if (!device) {
            device = await this.findFromDb(id);
        }
        return device ? device : null;
    }

    /**
     * Searches device from database and creates device object based on that if one is found.
     * @param {String} id 
     * @returns Found device, null if not found.
     */
    async findFromDb(id) {
        const device = await prisma.device.findFirst({ where: { deviceId: id } });
        if (!device) return null;
        return Device.deviceFromDatabase(device);
    }

    findByConnection(ws) {
        //if (!(ws instanceof WebSocket)) return null;

        for (const device of this.known_devices.values()) {
            if (device.connection === ws) return device;
        }
        return null;
    }

    async getAllInFrontendFormat() {
        const deviceArray = [];
        for (const [id, device] of this.known_devices) {
            const funcs = [];
            for (const key in device.functions) {
                funcs.push(device.functions[key]);
            }
            deviceArray.push({
                id: id,
                name: device.name,
                type: device.type,
                functions: funcs,
                active: device.active,
            });
        }

        const inactiveDevices = await prisma.device.findMany();

        inactiveDevices?.forEach(elem => {
            if(!deviceArray.find(e => e.id === elem.deviceId)) deviceArray.push({
                id: elem.deviceId,
                name: elem.name,
                type: elem.type,
                functions: [],
                active: false,
            })
        });

        return deviceArray;
    }
}

export { Devices };