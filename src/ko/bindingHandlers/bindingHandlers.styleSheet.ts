import * as ko from "knockout";
import { EventManager } from "@paperbits/common/events";
import { StyleCompiler, StyleModel } from "@paperbits/common/styles";


// @BindingHandlers("stylesheet")
export class StylesheetBindingHandler {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly eventManager: EventManager
    ) {
        ko.bindingHandlers["styleSheet"] = {
            init: (element: HTMLStyleElement, valueAccessor) => {
                const applyStyles = async () => {
                    const newStyles = await this.styleCompiler.compileCss();
                    const styleElement = <HTMLStyleElement>element;
                    styleElement.innerHTML = newStyles;
                };

                const applyLocalStyles = (styleModel: StyleModel) => {
                    const textNode = document.createTextNode(styleModel.css);
                    textNode["key"] = styleModel.key;
                    element.appendChild(textNode);
                };

                const removeLocalStyles = (styleModel: StyleModel) => {
                    const nodes = Array.prototype.slice.call(element.childNodes);
                    const node = nodes.find(x => x["key"] === styleModel.key);

                    if (node) {
                        element.removeChild(node);
                    }
                };

                applyStyles();

                this.eventManager.addEventListener("onStyleChange", applyStyles);
                this.eventManager.addEventListener("onLocalStyleChange", applyLocalStyles);
                this.eventManager.addEventListener("onLocalStyleRemove", removeLocalStyles);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    // 
                });
            }
        };
    }
}

