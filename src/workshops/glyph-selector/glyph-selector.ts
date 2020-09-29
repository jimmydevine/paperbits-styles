
import * as ko from "knockout";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common";
import template from "./glyph-selector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import * as opentype from "opentype.js";


@Component({
    selector: "glyph-selector",
    template: template
})
export class GlyphSelector {
    private cellCount = 100;
    public cellWidth = 44;
    public cellHeight = 40;
    public cellMarginTop = 1;
    public cellMarginBottom = 8;
    public cellMarginLeftRight = 1;
    public glyphMargin = 5;
    public pixelRatio = window.devicePixelRatio || 1;

    private arrowLength = 10;
    public arrowAperture = 4;

    private pageSelected;
    public font;
    public fontScale;
    public fontSize;
    public fontBaseline;
    public glyphScale;
    public glyphSize;
    public glyphBaseline;

    public glyphs2: ko.ObservableArray;
    public pages: ko.ObservableArray;


    constructor() {
        this.glyphs2 = ko.observableArray();
        this.pages = ko.observableArray();

        this.cellSelect = this.cellSelect.bind(this);
    }

    @OnMounted()
    public async init(): Promise<void> {
        this.prepareGlyphList();

        const font = await opentype.load("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/webfonts/fa-regular-400.ttf", null, { lowMemory: true });

        console.log(font);
        this.onFontLoaded(font);
    }

    private prepareGlyphList(): void {
        for (let i = 0; i < this.cellCount; i++) {
            this.glyphs2().push({ id: "g" + i, index: i });
        }
    }

    private formatUnicode(unicode: any): string {
        unicode = unicode.toString(16);

        if (unicode.length > 4) {
            return ("000000" + unicode.toUpperCase()).substr(-6);
        } else {
            return ("0000" + unicode.toUpperCase()).substr(-4);
        }
    }

    private renderGlyphItem(canvas: HTMLCanvasElement, glyphIndex): void {
        const cellMarkSize = 4;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.cellWidth, this.cellHeight);
        if (glyphIndex >= this.font.numGlyphs) return;

        ctx.fillStyle = "#606060";
        ctx.font = "9px sans-serif";
        ctx.fillText(glyphIndex, 1, this.cellHeight - 1);

        const glyph = this.font.glyphs.get(glyphIndex),
            glyphWidth = glyph.advanceWidth * this.fontScale,
            xmin = (this.cellWidth - glyphWidth) / 2,
            xmax = (this.cellWidth + glyphWidth) / 2,
            x0 = xmin;

        ctx.fillStyle = "#a0a0a0";
        ctx.fillRect(xmin - cellMarkSize + 1, this.fontBaseline, cellMarkSize, 1);
        ctx.fillRect(xmin, this.fontBaseline, 1, cellMarkSize);
        ctx.fillRect(xmax, this.fontBaseline, cellMarkSize, 1);
        ctx.fillRect(xmax, this.fontBaseline, 1, cellMarkSize);

        ctx.fillStyle = "#000000";
        glyph.draw(ctx, x0, this.fontBaseline, this.fontSize);
    }

    private displayGlyphPage(pageNum: number): void {
        this.pageSelected = pageNum;
        const firstGlyph = pageNum * this.cellCount;

        for (let i = 0; i < this.cellCount; i++) {
            this.renderGlyphItem(<HTMLCanvasElement>document.getElementById("g" + i), firstGlyph + i);
        }
    }

    private pageSelect(pageNum: number): void {
        this.displayGlyphPage(pageNum);
    }

    private onFontLoaded(font): void {
        this.font = font;

        const w = this.cellWidth - this.cellMarginLeftRight * 2,
            h = this.cellHeight - this.cellMarginTop - this.cellMarginBottom,
            head = this.font.tables.head,
            maxHeight = head.yMax - head.yMin;

        this.fontScale = Math.min(w / (head.xMax - head.xMin), h / maxHeight);
        this.fontSize = this.fontScale * this.font.unitsPerEm;
        this.fontBaseline = this.cellMarginTop + h * head.yMax / maxHeight;

        const numPages = Math.ceil(font.numGlyphs / this.cellCount);

        for (let i = 0; i < numPages; i++) {
            this.pages.push(i);
        }

        this.displayGlyphPage(0);

        setTimeout(() => { this.displayGlyphPage(0); }, 1000);
    }

    public cellSelect(glyphInfo: any): void {
        if (!this.font) {
            return;
        }

        const firstGlyphIndex = this.pageSelected * this.cellCount,
            cellIndex = glyphInfo.index,
            glyphIndex = firstGlyphIndex + cellIndex;

        const glyph = this.font.glyphs.get(glyphIndex);

        console.log(glyph);
    }
}