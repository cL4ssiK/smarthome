import { Function } from "./Function.js";

class Coffeemaker {
    constructor(device_id, connection, name="") {
        this.name = name;
        this.device_id = device_id;
        this.connection = connection;
        this.functions = {
            on: new Function(1, "Brew coffee"),
        };
    }

    send_command(command) {
        const func = this.functions[command];
        func.execute(this.connection);
    }
}

export { Coffeemaker };