export default abstract class BaseValue<T> {
    static htmlEscape = (val: string) => val.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    abstract className: string;
    abstract stringify(val: T): string;
    value: T;
    constructor(val: T) {
        this.value = val;
    }

    /** Renders an element with proper classes, but no content */
    renderWrapper(): Element {
        const $elm = document.createElement("span");
        $elm.classList.add("type");
        $elm.classList.add(`type--${this.className}`);
        return $elm;
    }

    /** Renders the Value in a way that's suitable for display inside other components (e.g. no expandable) */
    renderTitle(): Element {
        const $elm = BaseValue.prototype.render.call(this, 0, [this.value]);
        return $elm;
    }

    /**
     * Renders the Value in the usual way (e.g. with expandable)
     * @param {number} index The index of the value in the args
     * @param {any[]} args The args this is logged with - used for e.g. string formatting
     * @param {boolean} isRoot Whether we are rendering at the root level
     **/
    render(index: number, args: any[], isRoot: boolean = false): Element {
        const $elm = this.renderWrapper();
        $elm.innerHTML = BaseValue.htmlEscape(this.stringify(this.value));
        return $elm;
    }
}
