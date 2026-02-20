import { Device } from "./Device.js";

class Devices {
    constructor() {
        this.known_devices = new Map();
    }

    size() {
        return this.known_devices.size;
    }

    add(device) {
        if (!(device instanceof Device)) return;
        this.known_devices.set(device.device_id, device);
    }

    remove(id) {
        this.findById(id)?.disconnect();
        this.known_devices.delete(id);
    }

    findById(id) {
        return this.known_devices.get(id);
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