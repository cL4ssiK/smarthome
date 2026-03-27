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

    async remove(id) {
        const device = await this.findById(id);
        device?.disconnect();
        device.delete();
        this.known_devices.delete(id);
    }

    async findById(id) {
        let device = this.known_devices.get(id);
        if (!device) {
            device = await this.findFromDb(id);
        }
        return device ? device : null;
    }

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

    getAllInFrontendFormat() {
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
        return deviceArray;
    }
}

export { Devices };