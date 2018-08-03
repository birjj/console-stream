import BaseValue from "../base-value";

// https://github.com/ChromeDevTools/devtools-frontend/blob/4b002328ab2df8e40df7561d9a87623f6173cd65/front_end/console/ConsoleViewMessage.js#L809-L831
const whitelistedStylePrefixes = [
    "background", "border", "color", "font", "line", "margin", "padding", "text", "-webkit-background",
    "-webkit-border", "-webkit-font", "-webkit-margin", "-webkit-padding", "-webkit-text"
];
const formatters: { [k: string]: (val: any) => Element } = {
    f: function floatFormatter(val: any): Element {
        const $outp = document.createElement("span");
        if (typeof val !== "number") {
            $outp.textContent = "NaN";
            return $outp;
        }
        $outp.textContent = ""+val;
        return $outp;
    },
    i: function integerFormatter(val: any): Element {
        const $outp = document.createElement("span");
        if (typeof val !== "number") {
            $outp.textContent = "NaN";
            return $outp;
        }
        $outp.textContent = ""+Math.floor(val);
        return $outp;
    },
    d: function integerFormatter(val: any): Element {
        return formatters.i(val);
    },
    c: function styleFormatter(val: any): Element {
        return formatters.i(val);
    },
};

export default class StringValue extends BaseValue<string> {
    className = "string";
    stringify(val: string) {
        return ""+val;
    }
    
    render(index: number, args: any[], isRoot: boolean = false) {
        const $elm = this.renderWrapper();
        this.value.split(/(?=%[c])|(?<=%[c])/)
            .map(val => {
                if (/^%[c]$/.test(val)) {
                    return formatters[val[1]](this.value);
                }
                return document.createTextNode(val);
            })
            .forEach($val => $elm.appendChild($val));
        return $elm;
    }
}
