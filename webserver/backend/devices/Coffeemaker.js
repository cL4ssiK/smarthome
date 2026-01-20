
class Coffeemaker {
    constructor(device_id, connection, name="") {
        this.name = name;
        this.device_id = device_id;
        this.connection = connection;
        this.commands = {
            on: 1,
        };
    }
    
    turn_on() {
        const command = {
            type: "feature",
            payload:{ on: "coffee" }
        };

        this.connection.send(JSON.stringify(command));
    }

    send_message(object) {
        this.connection.send(JSON.stringify(object));
    }

    send_command(command) {
        const cmd = this.commands[command];
        const object = {
            type: "command",
            payload: {
                command: cmd
            }
        }
        if (object) {
            this.connection.send(JSON.stringify(object));
        }
    }
}

export { Coffeemaker };