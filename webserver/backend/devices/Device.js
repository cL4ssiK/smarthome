import { Function, TimedFunction } from "./Function.js";
import prisma from '../database/prisma.js';

class Device {
    //constructor(device_id, functions, type="", name="") {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.device_id = data.deviceId;
        this.type = data.type;
        this.connection = null;
        this.active = false;
        this.functions = this.#deviceFunctionsProvider(data.functions);
    }

    static deviceFromDatabase(dbData) {
        return new Device({
            id: dbData.id,
            deviceId: dbData.deviceId,
            name: dbData.name,
            type: dbData.type,
            functions: null,
        });
    }

    // Use this when a user submits a form (no ID yet)
    static newDevice(device_id, functions, type="", name="") {
        return new Device({
            id: null,
            deviceId: device_id,
            name: name,
            type: type,
            functions: functions,
        });
    }

    async save() {
        if (this.id) {
            // Update existing
            return await prisma.device.update({
                where: { id: this.id },
                data: { 
                    deviceId: this.device_id,
                    name: this.name,
                    type: this.type 
                }
            });
        } else {
            // Create new
            const newRecord = await prisma.device.create({
                data: { 
                    deviceId: this.device_id,
                    name: this.name,
                    type: this.type 
                }
            });
            this.id = newRecord.id; // Sync the ID back to the object
            return newRecord;
        }
    }

    async delete() {
        if (!this.id) return;

        await prisma.device.delete({ where: { id: this.id } });
    }

    addFunctions(functions) {
        this.functions = this.#deviceFunctionsProvider(functions);
    }

    connect(ws) {
        this.connection = ws;
        this.active = true;
    }

    disconnect() {
        this.connection?.close();
        this.connection = null;
        this.active = false;
    }

    send_command(command) {
        const func = this.functions[command];
        func.execute(this.connection);
    }

    set_timer(command, time, timeS, type) {
        const func = this.functions[command];
        if (!(func instanceof TimedFunction)) { return; }
        func.setTimer(time, timeS, type, this.connection);
    }

    remove_timer(command, type) {
        const func = this.functions[command];
        if (!(func instanceof TimedFunction)) { return; }
        func.cancelTimer(type);
    }

    changeFunctionState(state, code) {
        this.functions[code].setState(state);
    }

    async changeName(name) {
        if (name === this.name || typeof name !== 'string' || name.trim() === "") return false;
        if (await this.updateNameOnDb(name)) this.name = name;
        return true;
    }

    async updateNameOnDb(name) {
        try{
            await prisma.device.update({
                where: { id: this.id },
                data: { name: name }
            });
            return true;
        } catch(err){
            console.log(err);
            return false;
        }
    }

    #deviceFunctionsProvider(functions) {
        const funcs = {};
        if (functions === null) return funcs;
        functions.forEach(func => {
            const f = func.allowtimer ? new TimedFunction(func.code, func.name) : new Function(func.code, func.name);
            funcs[func.code] = f;
        });
        return funcs;
    }
}

export { Device };