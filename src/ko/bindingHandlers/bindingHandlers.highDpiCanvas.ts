import * as ko from "knockout";
import { ShadowContract } from "../../contracts/shadowContract";


ko.bindingHandlers["highDpiCanvas"] = {
    update: (canvas: HTMLCanvasElement, valueAccessor: () => ShadowContract) => {
        const pixelRatio = window.devicePixelRatio || 1;

        if (pixelRatio === 1) {
            return;
        }

        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = oldWidth * pixelRatio;
        canvas.height = oldHeight * pixelRatio;
        canvas.style.width = oldWidth + "px";
        canvas.style.height = oldHeight + "px";
        canvas.getContext("2d").scale(pixelRatio, pixelRatio);
    }
};