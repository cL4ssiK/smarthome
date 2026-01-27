import { Function } from "./Function.js";

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
        this.connection = null;
        this.active = false;
    }

    send_command(command) {
        const func = this.functions[command];
        func.execute(this.connection);
    }

    changeFunctionState(state, code) {
        this.functions[code].setState(state);
    }

    #deviceFunctionsProvider(functions) {
        const funcs = {};
        functions.forEach(func => {
            funcs[func.code] = new Function(func.code, func.name);
        });
        return funcs;
    }
}

export { Device };