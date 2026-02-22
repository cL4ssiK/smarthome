
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

    askState(websocket) {
        const object = {
            type: "state",
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


class TimedFunction extends Function{
    constructor(code, name="") {
        super(code, name);

        this.timer = {
            on: {
                eventId: null,
                eventTriggerTime: null,
            },
            off: {
                eventId: null,
                eventTriggerTime: null,
            }
        };
    }

    /**
     * Function to time execution of specific function of the device.
     * @param {String} time event time, "HH:MM"
     * @param {int} timeS event time in seconds
     * @param {String} type Does the function turn device on or off, "on" or "off"
     */
    setTimer(time, timeS, type, ws) {
        const durationMs = timeS*1000;

        // Only allow function to be timed once for safety.
        if (this.timer[type]?.eventId) {
            this.cancelTimer(type);
        }
        
        const timeoutObj = setTimeout(() => {
            // If function is already at decireable state, do nothing.
            if (!(this.active === "err" || this.active === type)) this.execute(ws);
            else if (this.active === type) this.askState(ws);
            this.timer[type].eventId = null;
            this.timer[type].eventTriggerTime = null;
        }, durationMs);

        this.timer[type].eventId = timeoutObj[Symbol.toPrimitive]('number');
        this.timer[type].eventTriggerTime = time;
        console.log(`${type} timer set at: ${time}`);
    }

    cancelTimer(type) {
        const eventId = this.timer[type]?.eventId;
        if (!eventId) return;
        
        clearTimeout(eventId);
        this.timer[type].eventId = null;
        this.timer[type].eventTriggerTime = null; 
    }

    isTimerActive() {
        return (this.activateEventId || this.deactivateEventId) ? true : false;
    }
}

export { Function, TimedFunction };