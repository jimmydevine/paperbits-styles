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
                const applyStyleSheet = (key: string): void => {
                    const styleSheet = this.styleManager.getStyleSheet(key);
                    const css = compiler.styleSheetToCss(styleSheet);
                    const nodes = Array.prototype.slice.call(element.childNodes);

                    let stylesTextNode = nodes.find(x => x["key"] === key);

                    if (!stylesTextNode) {
                        stylesTextNode = document.createTextNode(css);
                        stylesTextNode["key"] = styleSheet.key;
                        element.appendChild(stylesTextNode);
                    }

                    stylesTextNode.textContent = css;
                };

                const removeStyleSheet = (key: string) => {
                    if (!key) {
                        return;
                    }

                    const nodes = Array.prototype.slice.call(element.childNodes);
                    const node = nodes.find(x => x["key"] === key);

                    if (node) {
                        element.removeChild(node);
                    }
                };

                this.eventManager.addEventListener("onStyleChange", applyStyleSheet);
                this.eventManager.addEventListener("onStyleRemove", removeStyleSheet);
            }
        };
    }
}