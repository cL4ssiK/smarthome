import { Function } from "./Function.js";

class Device {
    constructor(device_id, type, name="") {
        this.name = name;
        this.device_id = device_id;
        this.connection = null;
        this.active = false;
        this.functions = deviceFunctionsProvider(type);
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
}

function deviceFunctionsProvider(deviceType) {
    switch (deviceType) {
        case "coffeemaker":
            return {
                1: new Function(1, "Brew coffee"),
            };
        default:
            return {}
    }

}

export { Device };