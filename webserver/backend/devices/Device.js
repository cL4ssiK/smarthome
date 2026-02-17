import { Function, TimedFunction } from "./Function.js";

class Device {
    constructor(device_id, functions, name="") {
        this.name = name;
        this.device_id = device_id;
        this.connection = null;
        this.active = false;
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

    #deviceFunctionsProvider(functions) {
        const funcs = {};
        functions.forEach(func => {
            const f = func.allowtimer ? new TimedFunction(func.code, func.name) : new Function(func.code, func.name);
            funcs[func.code] = f;
        });
        return funcs;
    }
}

export { Device };