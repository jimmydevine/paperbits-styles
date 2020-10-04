import * as ko from "knockout";
import { ShadowContract } from "../../contracts/shadowContract";


ko.bindingHandlers["fontGlyph"] = {
    update: (canvas: HTMLCanvasElement, valueAccessor: () => ShadowContract) => {
        const pixelRatio = window.devicePixelRatio || 1;

        if (pixelRatio !== 1) {
            const oldWidth = canvas.width;
            const oldHeight = canvas.height;
            canvas.width = oldWidth * pixelRatio;
            canvas.height = oldHeight * pixelRatio;
            canvas.style.width = oldWidth + "px";
            canvas.style.height = oldHeight + "px";
            canvas.getContext("2d").scale(pixelRatio, pixelRatio);
        }

        const iconConfig: any = valueAccessor();
        const cellWidth = 50;
        const cellHeight = 50;
        const cellMarginTop = 10;
        const cellMarginBottom = 10;
        const cellMarginLeftRight = 10;

        const w = cellWidth - cellMarginLeftRight * 2;
        const h = cellHeight - cellMarginTop - cellMarginBottom;
        const head = iconConfig.font.tables.head;
        const maxHeight = head.yMax - head.yMin;

        const fontScale = Math.min(w / (head.xMax - head.xMin), h / maxHeight);
        const fontSize = fontScale * iconConfig.font.unitsPerEm;
        const fontBaseline = cellMarginTop + h * head.yMax / maxHeight;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, cellWidth, cellHeight);

        if (iconConfig.glyphIndex >= iconConfig.font.numGlyphs) {
            return;
        }

        const glyph = iconConfig.font.glyphs.get(iconConfig.glyphIndex),
            glyphWidth = glyph.advanceWidth * fontScale,
            xmin = (cellWidth - glyphWidth) / 2,
            xmax = (cellWidth + glyphWidth) / 2,
            x0 = xmin;

        glyph.draw(ctx, x0, fontBaseline, fontSize);
    }
};