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
            // init: (element: HTMLStyleElement, valueAccessor) => {
            //     ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
            //         // 
            //     });
            // },

            init: (element: HTMLStyleElement, valueAccessor) => {
                const applyStyles = async () => {
                    const newStyles = await this.styleCompiler.compileCss();
                    const styleElement = <HTMLStyleElement>element;
                    styleElement.innerHTML = newStyles;
                };

                const applyLocalStyles = (styleModel: StyleModel) => {
                    const cssStyleSheet = <CSSStyleSheet>element.sheet;

                    const css = styleModel.css;
                    const index = cssStyleSheet.rules.length;
                    cssStyleSheet.insertRule(css, index);

                    console.log(css);

                    const rule = cssStyleSheet.rules[index];
                    rule["key"] = styleModel.key;
                }

                applyStyles();

                this.eventManager.addEventListener("onStyleChange", applyStyles);
                this.eventManager.addEventListener("onLocalStyleChange", applyLocalStyles);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    // 
                });
            }
        };
    }
}

