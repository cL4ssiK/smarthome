
class Function {
    constructor(code, name="") {
        this.name = name;
        this.code = code;
        this.active = "off"; //on/off/err
    }

    execute(websocket) {
        const object = {
            type: "command",
            payload: { command: this.code }
        }

        if (object && websocket) {
            websocket.send(JSON.stringify(object));
        }
    }

    setState(state) {
        this.active = state;
    }
}

export { Function };