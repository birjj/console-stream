/**
 * An element that automatically selects everything inside of it when clicked.
 */
export default class Selectable {
    /** Whether we selected the element in this interaction round */
    hasSelected = false;
    /** If we are in the middle of a click, where the click happened */
    clickPos: [number, number] | null = null;
    /** The element we should select */
    $node: HTMLElement;

    constructor($node: HTMLElement) {
        if (!$node) {
            throw new Error("Cannot create Selectable for " + $node);
        }
        this.$node = $node;
        $node.addEventListener("focus", this.select);
        $node.addEventListener("mousedown", this.onMouseDown);
        $node.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("click", (e: MouseEvent) => {
            if (!$node.contains(e.target as Node)) {
                this.hasSelected = false;
            }
        });
    }

    shouldSelect() {
        return !this.hasSelected && !this.clickPos;
    }

    select = () => {
        if (!this.shouldSelect()) { return; }
        this.hasSelected = true;
        if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this.$node);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    onMouseDown = (e: MouseEvent) => {
        if (!(e.buttons & 1)) { return; }
        this.clickPos = [e.offsetX, e.offsetY];
    };

    onMouseUp = (e: MouseEvent) => {
        if (this.clickPos) {
            const dx = e.offsetX - this.clickPos[0];
            const dy = e.offsetY - this.clickPos[1];
            const dist = Math.sqrt(dx*dx + dy*dy);

            this.clickPos = null;
            if (dist < 10) {
                this.select();
            }
            this.hasSelected = true;
        }
    };
}
