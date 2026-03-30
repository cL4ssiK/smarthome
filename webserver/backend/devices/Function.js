import { Queue } from "bullmq";

class Function {

    constructor(code, name="") {
        this.name = name;
        this.code = code;
        this.active = "off"; //on/off/err
    }

    /**
     * Execute function.
     * @param {WebSocket} websocket 
     */
    execute(websocket) {
        const object = {
            type: "command",
            payload: { command: this.code }
        }
        
        if (object && websocket) {
            websocket.send(JSON.stringify(object));
        }
    }

    /**
     * Ask the state of function on physical device.
     * @param {WebSocket} websocket 
     */
    askState(websocket) {
        const object = {
            type: "state",
            payload: { command: this.code }
        }
        
        if (object && websocket) {
            websocket.send(JSON.stringify(object));
        }
    }

    /**
     * Set state of the function object.
     * @param {boolean} state 
     */
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

    /**
     * Cancels Timer
     * @param {String} type 
     * @returns 
     */
    cancelTimer(type) {
        const eventId = this.timer[type]?.eventId;
        if (!eventId) return;
        
        clearTimeout(eventId);
        this.timer[type].eventId = null;
        this.timer[type].eventTriggerTime = null; 
    }

    /**
     * Check if timer is active.
     * @returns boolean
     */
    isTimerActive() {
        return (this.activateEventId || this.deactivateEventId) ? true : false;
    }
}


//Purpose: execute function on client
//          function can use background process or be just function
class SpecialFunction extends Function {
    constructor(code, func="", name="") {
        super(code, name);
        this.customFunctionality = func;
        this.processId = null;
    }

    /**
     * Add process to queue.
     * @param {Queue} queue 
     * @param {String} name 
     * @param {Object} data 
     */
    async setProcess(queue, name, data) {
        try {
            this.processId = (await queue.add(name, data)).id;
            return {id: this.processId, status: "success"};
        } catch(err) {
            console.log(err);
            return { status: "error" };
        }
    }

}

export { Function, TimedFunction };