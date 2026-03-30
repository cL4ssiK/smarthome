import { Function, TimedFunction } from "./Function.js";
import prisma from '../database/prisma.js';

export class Device {

    constructor(data) {
        this.id = data?.id ? data.id : null;
        this.name = data.name;
        this.device_id = data.deviceId;
        this.type = data.type;
        this.connection = null;
        this.active = false;
        this.functions = null;
    }

    //FactoryMethod for later.
    static newDevice(data) {
        return new Device({
            id: (data?.id ? data.id : null),
            deviceId: data.deviceId,
            name: data.name,
            type: data.type,
        });
    }

    /**
     * Save Device in database.
     * @returns database entry as Object
     */
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

    /**
     * Delete device from database.
     * @returns 
     */
    async delete() {
        if (!this.id) return;

        await prisma.device.delete({ where: { id: this.id } });
    }

    /**
     * Add functions provided by physical device.
     * @param {Array} functions 
     */
    addFunctions(functions) {
        this.functions = this.#deviceFunctionsProvider(functions);
    }

    /**
     * Add websocket connection to device.
     * @param {WebSocket} ws 
     */
    connect(ws) {
        this.connection = ws;
        this.active = true;
    }

    /**
     * Close the websocket connection to physical device.
     */
    disconnect() {
        this.connection?.close();
        this.connection = null;
        this.active = false;
    }

    /**
     * Execute function on physical device.
     * @param {Int} command 
     */
    send_command(command) {
        const func = this.functions[command];
        func.execute(this.connection);
    }

    /**
     * Set timer on server for delayed function execution.
     * @param {Int} command 
     * @param {*} time 
     * @param {*} timeS 
     * @param {String} type 
     * @returns 
     */
    set_timer(command, time, timeS, type) {
        const func = this.functions[command];
        if (!(func instanceof TimedFunction)) { return; }
        func.setTimer(time, timeS, type, this.connection);
    }

    /**
     * Disable set timer.
     * @param {Int} command 
     * @param {String} type 
     * @returns 
     */
    remove_timer(command, type) {
        const func = this.functions[command];
        if (!(func instanceof TimedFunction)) { return; }
        func.cancelTimer(type);
    }

    /**
     * Set state of function.
     * @param {boolean} state 
     * @param {Int} code 
     */
    changeFunctionState(state, code) {
        this.functions[code].setState(state);
    }

    /**
     * Change name.
     * @param {String} name 
     * @returns 
     */
    async changeName(name) {
        if (name === this.name || typeof name !== 'string' || name.trim() === "") return false;
        if (await this.#updateNameOnDb(name)) this.name = name;
        return true;
    }

    async #updateNameOnDb(name) {
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
            f.setState(func.initialstate);
            funcs[func.code] = f;
        });
        return funcs;
    }
}
