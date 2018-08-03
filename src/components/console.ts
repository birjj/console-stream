import WSClient from "../ws-client";
import valueMapper from "../values/mapper";

interface ConsoleMessage {
    type: "log"|"warn"|"error", /* the method that was called */
    time: number, /* when the log happened */
    value: any[], /* the arguments that were logged */
}

class Message {
    /** The element that represents us */
    $elm: HTMLElement|null = null;
    /** The message we are built from */
    message: ConsoleMessage;
    /** When we were logged */
    time: Date;

    constructor(message: ConsoleMessage) {
        this.message = message;
        this.time = new Date(this.message.time);
    }

    /**
     * Turns a string into a value that can be inserted using .innerHTML
     */
    htmlifyString(str: string) {
        return str.replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    /**
     * Gets the element representation of a value
     */
    getElementForValue(value: any, index: number, args: any[]): Element {
        const valInstance = valueMapper(value);
        if (valInstance) {
            return valInstance.render(index, args, true);
        }

        const $outp = document.createElement("span");
        $outp.textContent = "<unknown>";
        return $outp;
    }

    /**
     * Gets the element representation of a time
     */
    getElementForTime(time: Date): HTMLElement {
        const $time = document.createElement("time");
        $time.dateTime = this.time.toISOString();
        $time.textContent =
            [this.time.getHours(), this.time.getMinutes(), this.time.getSeconds()]
                .map(num => num.toString().padStart(2, "0"))
                .join(":")
            + `.${this.time.getMilliseconds().toString().padEnd(3, "0")}`;
        $time.title = $time.dateTime.replace("T", " ").replace("Z", "");
        return $time;
    }

    /**
     * Gets the element that represents the message
     */
    render(): HTMLElement {
        if (this.$elm) { return this.$elm; }

        const $elm = document.createElement("div");
        $elm.classList.add("message");
        $elm.classList.add(`message--${this.message.type}`);

        $elm.appendChild(this.getElementForTime(this.time));
        const $content = document.createElement("div");
        $content.classList.add("content");
        this.message.value
            .map((v, i) => this.getElementForValue(v, i, this.message.value))
            .map($node => { $node.classList.add("value"); return $node; })
            .forEach($node => $content.appendChild($node));
        $elm.appendChild($content);
        
        return this.$elm = $elm;
    }
}

export default class Console {
    /** The console element we should bind to */
    $console: HTMLElement;
    /** The element in which we should insert our messages */
    $messages: HTMLElement;
    /** The messages we are displaying */
    messages: Message[] = [];
    /** Filter we are filtering messages by */
    filter: string = "";
    

    constructor($console: HTMLElement, ws: WSClient) {
        this.$console = $console;
        this.$messages = $console.getElementsByClassName("messages")[0] as HTMLElement;

        Array.from($console.getElementsByClassName("clear")).forEach(
            $clear => $clear.addEventListener("click", this.onClear)
        );
        Array.from($console.getElementsByClassName("filter")).forEach(
            $filter => $filter.addEventListener("input", this.onFilter)
        );

        ws.on("*", this.onMessage);
    }

    onMessage = (message: ConsoleMessage) => {
        if (!message.type || !message.value || !(message.value instanceof Array)) {
            return;
        }
        console.log("Received message", message);
        const msg = new Message(message);
        this.messages.push(msg);
        this.$messages.appendChild(msg.render());
    };

    onClear = () => {
        this.messages = [];
    };

    onFilter = (e: Event) => {
        const filter = (e.target as HTMLInputElement).value;
        console.log("Filter:", filter);
    }

    destroy() {
        while (this.$messages.lastChild) {
            this.$messages.removeChild(this.$messages.lastChild);
        }
    }
}
