export default class Expandable {
    $title: Element;
    $content: Element;
    $elm: Element|null = null;
    expanded: boolean = false;
    
    constructor($title: Element, $content: Element) {
        this.$title = $title;
        this.$content = $content;
    }

    render() {
        if (this.$elm) { return this.$elm; }

        const $elm = document.createElement("span");
        $elm.classList.add("expandable");
        
        // create arrow
        const $arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        $arrow.classList.add("arrow");
        const $symbol = document.createElementNS("http://www.w3.org/2000/svg", "use");
        $symbol.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#i-arrow");
        $arrow.appendChild($symbol);
        
        // create title
        const $title = document.createElement("span");
        $title.classList.add("expandable__title");
        $title.appendChild($arrow);
        $title.appendChild(this.$title);
        $elm.appendChild($title);
        $title.addEventListener("click", () => {
            this.expanded = !this.expanded;
            $elm.classList.toggle("expandable--expanded", this.expanded);
        });
        
        // create content
        const $content = document.createElement("div");
        $content.classList.add("expandable__content");
        $content.appendChild(this.$content);
        $elm.appendChild($content);

        return this.$elm = $elm;
    }
}
