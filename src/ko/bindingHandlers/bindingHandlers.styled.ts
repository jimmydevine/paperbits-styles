import * as ko from "knockout";
import { StyleModel } from "@paperbits/common/styles";


export class StyledBindingHandler {
    constructor() {
        ko.bindingHandlers["styled"] = {
            update: async (element: HTMLElement, valueAccessor) => {
                const styleModel: StyleModel = ko.unwrap(valueAccessor());

                if (!styleModel) {
                    return;
                }

                styleModel.bindingContext.styleManager.setStyleSheet(styleModel.styleSheet);

                ko.applyBindingsToNode(element, { css: styleModel.classNames }, null);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    styleModel.bindingContext.styleManager.removeStyleSheet(styleModel.key);
                });
            }
        };
    }
}