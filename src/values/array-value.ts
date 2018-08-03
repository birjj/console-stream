import BaseValue from "./base-value";
import valueMapper from "./mapper";
import Expandable from "../components/expandable";

export default class ArrayValue extends BaseValue<Array<any>> {
    className = "array";
    stringify(val: Array<any>) {
        return `Array(${val.length})`;
    }

    renderExpandableTitle(): Element {
        const $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode(`(${this.value.length}) [`));
        this.value.forEach(
            (val, i) => {
                const _val = valueMapper(val);
                if (_val) {
                    $elm.appendChild(_val.renderTitle());
                    $elm.appendChild(document.createTextNode(", "));
                }
            }
        );
        // we have an extra ", " appended
        $elm.removeChild($elm.lastChild as Node);
        $elm.appendChild(document.createTextNode("]"));
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
        for (let i = 0; i < this.value.length; ++i) {
            $outp.appendChild(this.renderExpandableContentRow(""+i, this.value[i]));
        }

        // add `length`
        const $lengthRow = this.renderExpandableContentRow("length", this.value.length);
        $lengthRow.classList.add("dim");
        $outp.appendChild($lengthRow);

        return $outp;
    }

    render(index: number, args: any[], isRoot: boolean = false) {
        const $elm = (new Expandable(this.renderExpandableTitle(), this.renderExpandableContent())).render();
        $elm.classList.add("expandable--array");
        return $elm;
    }
}
