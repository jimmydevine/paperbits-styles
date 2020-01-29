import * as ko from "knockout";
import { StyleModel } from "@paperbits/common/styles";
import { EventManager } from "@paperbits/common/events";


export class StyledBindingHandler {
    constructor(private readonly eventManager: EventManager) {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleModel: StyleModel = ko.unwrap(valueAccessor());

                if (!styleModel) {
                    return;
                }

                const cssObservable = ko.observable();

                let styleElement = element.ownerDocument.getElementById(styleModel.key);

                if (styleModel.css) {
                    if (!styleElement) {
                        styleElement = element.ownerDocument.createElement("style");
                        styleElement.id = styleModel.key;
                        element.ownerDocument.head.appendChild(styleElement);
                    }

                    styleElement.innerHTML = styleModel.css;
                }
                else if (styleElement) {
                    styleElement.remove();
                }

                cssObservable(styleModel.classNames);

                ko.applyBindingsToNode(element, { css: cssObservable }, null);

                this.eventManager.dispatchEvent("onLocalStyleChange", styleModel);
            }
        };
    }
}