import BaseValue from "./base-value";

interface FunctionRepresentation {
    __type: "function";
    stringified: string;
}

export default class FunctionValue extends BaseValue<FunctionRepresentation> {
    className = "function";
    stringify(val: FunctionRepresentation) {
        return val.stringified.replace(/^function/, "");
    }

    render(index: number, args: any[], isRoot: boolean = false) {
        const $elm = super.render(index, args);
        $elm.setAttribute("title", this.value.stringified);
        const $f = document.createElement("span");
        $f.classList.add("type--function__f");
        if (/^function/.test(this.value.stringified)) {
            $f.textContent = "ƒ";
            $elm.insertBefore($f, $elm.firstChild);
        }
        return $elm;
    }
}
