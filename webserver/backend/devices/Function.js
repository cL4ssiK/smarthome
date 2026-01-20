
class Function {
    constructor(code, name="") {
        this.name = name;
        this.code = code;
        this.active = false;
    }

    execute(websocket) {
        const object = {
            type: "command",
            payload: { command: this.code }
        }

        if (object) {
            websocket.send(JSON.stringify(object));
        }
    }
}

export { Function };