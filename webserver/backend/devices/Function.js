
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


class TimedFunction extends Function{
    constructor(code, name="") {
        super(code, name);

        this.activateEventId = null;
        this.activateEventTriggerTime = null;

        this.deactivateEventId = null;
        this.deactivateEventTriggerTime = null;
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
        if (type === "on" && this.activateEventId) {
            this.cancelTimer(this.activateEventId, type);
        }
        if (type === "off" && this.deactivateEventId) {
            this.cancelTimer(this.deactivateEventId, type);
        }

        if (type === "on") {
            const timeoutObj = setTimeout(() => {
                // If function is already at decireable state, do nothing.
                if (!(this.active === "err" || this.active === type)) this.execute(ws);
                this.activateEventId = null;
                this.activateEventTriggerTime = null;
            }, durationMs);

            this.activateEventId = timeoutObj[Symbol.toPrimitive]('number');
            this.activateEventTriggerTime = time;
            console.log(`${type} timer set at: ${time}`);
        }
        else if (type === "off") {
            const timeoutObj = setTimeout(() => {
                // If function is already at decireable state, do nothing.
                if (!(this.active === "err" || this.active === type)) this.execute(ws);
                this.deactivateEventId = null;
                this.deactivateEventTriggerTime = null;
            }, durationMs);
    
            this.deactivateEventId = timeoutObj[Symbol.toPrimitive]('number');
            this.deactivateEventTriggerTime = time;
            console.log(`${type} timer set at: ${time}`);
        }
    }

    cancelTimer(eventId, type) {
        if (eventId) {
            clearTimeout(eventId);
            if (type === "on") {
                this.activateEventId = null;
                this.activateEventTriggerTime = null;
            }
            else if (type === "off"){
                this.deactivateEventId = null;
                this.deactivateEventTriggerTime = null;
            }
        }
    }

    isTimerActive() {
        return (this.activateEventId || this.deactivateEventId) ? true : false;
    }
}

export { Function, TimedFunction };