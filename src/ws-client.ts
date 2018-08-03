/**
 * Our connection to the server.
 */
export default class WSClient {
    channel: string;
    ws: WebSocket;

    _listeners: { [event: string]: Function[] } = {};

    constructor(channel: string) {
        this.channel = channel;
        const HOST = location.origin.replace(/^http/, "ws");
        this.ws = new WebSocket(HOST);
        this.ws.addEventListener("open", () => {
            this.ws.send(JSON.stringify({ channel, }));
        });
        this.ws.addEventListener("message", this._handleMessage);
    }

    /** Shuts down the connection */
    close() {
        this.ws.close();
    }

    _handleMessage = (e: any) => {
        const msg = JSON.parse(e.data);
        const unserialized = this._unserializeMessage(msg);
        this.emit(msg.type, unserialized);
        this.emit("*", unserialized);
    }

    _unserializeValue(value: any) {
        if (!(value instanceof Object)) { return value; }
        if (value.__type) {
            switch (value.__type) {
                case "undefined":
                    return undefined;
                case "date":
                    return new Date(value.value);
                case "error":
                    const err = new Error();
                    err.message = value.message;
                    err.stack = value.stack;
                    return err;
            }
        }
        return value;
    }

    _unserializeMessage(msg: { value: any[] }) {
        if (msg.value && msg.value instanceof Array) {
            msg.value = msg.value.map(v => this._unserializeValue(v));
        }
        return msg;
    }

    /* EventEmitter implementation */
    on(event: string, cb: Function) {
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(cb);
    }
    off(event: string, cb: Function) {
        if (this._listeners[event] && this._listeners[event].includes(cb)) {
            this._listeners[event] = this._listeners[event].filter(
                f => f !== cb
            );
        }
    }
    emit(event: string, ...data: any[]) {
        if (!this._listeners[event]) { return; }
        this._listeners[event].forEach(cb => cb(...data));
    }
}
