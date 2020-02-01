import * as ko from "knockout";
import { StyleModel } from "@paperbits/common/styles";
import { StyleManager } from "../..";


export class StyledBindingHandler {
    constructor(private readonly styleManager: StyleManager) {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleModel: StyleModel = ko.unwrap(valueAccessor());

                if (!styleModel) {
                    return;
                }

                this.styleManager.setStyleSheet(styleModel.styleSheet);

                ko.applyBindingsToNode(element, { css: styleModel.classNames }, null);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    this.styleManager.removeStyleSheet(styleModel.key);
                });
            }
        };
    }
}