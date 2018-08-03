/**
 * An element that contains tabbed content.
 */
export default class Tabbed {
    $node: Element;
    tabs: ({
        $elm: Element | null,
        $target: Element | null,
    })[];
    constructor($node: Element) {
        this.$node = $node;
        this.tabs = Array.from($node.querySelectorAll(".tab")).map($tab => {
            $tab.addEventListener("click", () => {
                this.handleTabChange($tab);
            });
            return {
                $elm: $tab,
                $target: $node.querySelector($tab.getAttribute("data-target") as string),
            };
        });
    }

    handleTabChange($elm: Element) {
        this.tabs.forEach(tab => {
            const isActive = tab.$elm === $elm;
            if (tab.$target) {
                tab.$target.classList.toggle("active", isActive);
            }
            if (tab.$elm) {
                tab.$elm.classList.toggle("active", isActive);
            }
        });
    }
}
