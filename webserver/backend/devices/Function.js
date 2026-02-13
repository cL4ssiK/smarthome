
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
        this.eventId = null;
    }

    /**
     * Function to time execution of specific function of the device.
     * @param {String} time event time, "HH:MM"
     * @param {String} type Does the function turn device on or off, "on" or "off"
     */
    setTimer(time, type) {
        const [h, m] = time.split(':');
        const now = new Date();

        const eventExecutionTime = new Date(parseInt(h), parseInt(m));

        if (eventExecutionTime <= now) {
            eventExecutionTime.setDate(eventExecutionTime.getDate() + 1);
        }

        const durationMs = eventExecutionTime.getTime() - now.getTime();

        // Only allow function to be timed once for safety.
        if (this.eventId) {
            this.cancelTimer();
        }

        this.eventId = setTimeout(() => {
            // If function is already at decireable state, do nothing.
            if (this.active === "err" || this.active === type) return;
            this.execute();
        }, durationMs);
    }

    cancelTimer() {
        if (this.eventId) {
            clearTimeout(this.eventId);
            this.eventId = null;
        }
    }

    isTimerActive() {
        return this.eventId ? true : false;
    }
}

export { Function, TimedFunction };