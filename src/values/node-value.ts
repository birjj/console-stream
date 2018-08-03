import BaseValue from "./base-value";

interface NodeRepresentation {
    __type: "node";
    tagName: string,
    attrs: {[k: string]: string},
}

export default class NodeValue extends BaseValue<NodeRepresentation> {
    className = "node";
    stringify(val: NodeRepresentation) {
        return val.tagName;
    }

    renderAttrs(args: {[k: string]: string}): Element[] {
        return Object.keys(args)
            .map(
                key => {
                    const $outp = document.createElement("span");
                    $outp.classList.add("attr");

                    const $key = document.createElement("span");
                    $key.classList.add("attr__key");
                    $key.textContent = key;
                    $outp.appendChild($key);

                    if (args[key]) {
                        $outp.appendChild(document.createTextNode("=\""));

                        const $val = document.createElement("span");
                        $val.classList.add("attr__val");
                        $val.textContent = args[key];
                        $outp.appendChild($val);

                        $outp.appendChild(document.createTextNode("\""));
                    }
                    return $outp;
                }
            );
    }

    render(index: number, args: any[], isRoot: boolean = false) {
        const $elm = this.renderWrapper();
        $elm.appendChild(document.createTextNode("<"));

        const $tagStart = document.createElement("span");
        $tagStart.classList.add("type--node__start");
        $tagStart.textContent = this.value.tagName;
        $elm.appendChild($tagStart);

        const $args = this.renderAttrs(this.value.attrs);
        if ($args.length) {
            $args.forEach($node => {
                $elm.appendChild(document.createTextNode(" "));
                $elm.appendChild($node);
            });
        }

        $elm.appendChild(document.createTextNode(">…<"));

        const $tagEnd = document.createElement("span");
        $tagEnd.classList.add("type--node__end");
        $tagEnd.textContent = "/" + this.value.tagName;
        $elm.appendChild($tagEnd);

        $elm.appendChild(document.createTextNode(">"));
        return $elm;
    }
}
