import BaseValue from "./base-value";
import valueMapper from "./mapper";
import Expandable from "../components/expandable";

export default class ObjectValue extends BaseValue<{[k: string]: any}> {
    className = "object";
    stringify(val: Object) {
        return "Object";
    }

    renderTitle() {
        const $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode(`{${
            Object.keys(this.value).length
                ? "…"
                : ""
        }}`));
        return $elm;
    }

    renderExpandableTitle(isRoot: boolean): Element {
        const $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode("{"));

        // add at most 5 key-value pairs to the title
        let validKeys = 0;
        Object.keys(this.value)
            .forEach(k => {
                const val = this.value[k];
                const _val = valueMapper(val);
                if (_val) {
                    ++validKeys;
                    if (validKeys <= 5) {
                        const $key = document.createElement("span");
                        $key.classList.add("key");
                        $key.textContent = k+":";
                        $elm.appendChild($key);
                        $elm.appendChild(_val.renderTitle());
                        $elm.appendChild(document.createTextNode(", "));
                    }
                }
            });
        // but show "..." if we have more that we don't show
        if (validKeys > 5) {
            $elm.appendChild(document.createTextNode("…"));
        } else if (validKeys) {
            // we have an extra ", " appended
            $elm.removeChild($elm.lastChild as Node);
        }
        $elm.appendChild(document.createTextNode("}"));
        
        return $elm;
    }

    renderExpandableContentRow(key: string, value: any) {
        const $row = document.createElement("div");
        $row.classList.add("key-value");

        // add key
        const $key = document.createElement("span");
        $key.classList.add("key");
        $key.textContent = key+":";
        $row.appendChild($key);

        // add value
        const _val = valueMapper(value);
        if (_val) {
            $row.appendChild(_val.render(0, [_val.value]));
        }

        return $row;
    }

    renderExpandableContent(): Element {
        const $outp = document.createElement("div");

        Object.keys(this.value)
            .forEach(
                k => {
                    const $val = this.renderExpandableContentRow(k, this.value[k]);
                    $outp.appendChild($val);
                }
            );

        return $outp;
    }

    render(index: number, args: any[], isRoot: boolean = false) {
        const $elm = (new Expandable(this.renderExpandableTitle(isRoot), this.renderExpandableContent())).render();
        $elm.classList.add("expandable--object");
        return $elm;
    }
}
