import { Device } from "./Device.js";
import prisma from '../database/prisma.js';

export class Devices {

    constructor() {
        this.known_devices = new Map();
    }

    /**
     * Gets all devices from database and creates objects for them.
     */
    //TODO: stop using static methods, they are obsolete.
    async fetchDevicesFromDb() {
        const devices = await prisma.device.findMany();
        devices.forEach(device => {
            const d = Device.deviceFromDatabase(device);
            this.add(d);
        });
    }

    /**
     * Amount of devices in server memory.
     * @returns Integer
     */
    size() {
        return this.known_devices.size;
    }

    /**
     * Add new device to server memory.
     * @param {Device} device 
     * @returns 
     */
    add(device) {
        if (!(device instanceof Device)) return;
        this.known_devices.set(device.device_id, device);
    }

    /**
     * 
     * @param {Object} data {deviceId, state, code}
     */
    changeFunctionState(data) {
        const device = this.known_devices.get(data.deviceId);
        device.changeFunctionState(data.state, data.code);
    }

    /**
     * Send command to specific device.
     * @param {String} deviceId 
     * @param {Int} funcCode 
     */
    sendCommand(deviceId, funcCode) {
        const device = this.known_devices.get(deviceId);
        device.send_command(funcCode);
    }

    /**
     * Set timed function on specific device.
     * @param {Object} data 
     */
    sendTimedCommand(data) {
        const device = this.known_devices.get(data?.deviceId);
        device.set_timer(data?.code, data?.time, data?.timeS, data?.type);
    }

    /**
     * Remove set timer from function of specific device.
     * @param {String} deviceId 
     * @param {Int} funcCode 
     * @param {String} type 
     */
    removeTimedCommand(deviceId, funcCode, type) {
        const device = this.known_devices.get(deviceId);
        device.remove_timer(funcCode, type);
    }
    
    // TODO: There is bug in rename, that returns old name if device is renamed as first thing after connecting.
    /**
     * Renames device
     * @param {String} deviceId 
     * @param {String} name 
     * @returns 
     */
    async renameDevice(deviceId, name) {
        const device = await this.findById(deviceId);
        console.log(device);
        const oldName = device?.name;
        if (!(await device.changeName(name))) {
            console.log("New name is faulty, no renaming.");
            return;
        }
        console.log("Device " + oldName + " renamed to " + name + ".");
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
        return Device.newDevice(device);
    }

    /**
     * Find device based on the websocket connection object.
     * @param {WebSocket} ws 
     * @returns Device or null
     */
    findByConnection(ws) {
        //if (!(ws instanceof WebSocket)) return null;

        for (const device of this.known_devices.values()) {
            if (device.connection === ws) return device;
        }
        return null;
    }

    /**
     * Devices in format suitable for frontend.
     * @returns array of device objects
     */
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
