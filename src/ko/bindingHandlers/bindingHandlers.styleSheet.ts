import * as ko from "knockout";
import { EventManager } from "@paperbits/common/events";
import { StyleManager } from "../../styleManager";
import { JssCompiler } from "../../jssCompiler";


// @BindingHandlers("stylesheet")
export class StylesheetBindingHandler {
    constructor(
        private readonly styleManager: StyleManager,
        private readonly eventManager: EventManager
    ) {
        const compiler = new JssCompiler();

        ko.bindingHandlers["styleSheet"] = {
            init: (element: HTMLStyleElement) => {
                const globalStylesTextNode = document.createTextNode("");
                element.appendChild(globalStylesTextNode);

                const applyGlobalStyles = async () => {
                    const globalStyleSheet = this.styleManager.getStyleSheet("global");
                    const globalCss = compiler.styleSheetToCss(globalStyleSheet);
                    globalStylesTextNode.textContent = globalCss;
                };

                const applyStyle = (key: string) => {
                    const styleSheet = this.styleManager.getStyleSheet(key);
                    const css = compiler.styleSheetToCss(styleSheet);

                    const nodes = Array.prototype.slice.call(element.childNodes);
                    const node = nodes.find(x => x["key"] === key);

                    if (!node) {
                        const stylesTextNode = document.createTextNode(css);
                        stylesTextNode["key"] = styleSheet.key;
                        element.appendChild(stylesTextNode);
                    }

                    node.textContent = css;
                };

                const removeStyle = (key: string) => {
                    if (!key) {
                        return;
                    }

                    const nodes = Array.prototype.slice.call(element.childNodes);
                    const node = nodes.find(x => x["key"] === key);

                    if (node) {
                        element.removeChild(node);
                    }
                };

                applyGlobalStyles();

                this.eventManager.addEventListener("onStyleChange", applyStyle);
                this.eventManager.addEventListener("onStyleRemove", removeStyle);
            }
        };
    }
}