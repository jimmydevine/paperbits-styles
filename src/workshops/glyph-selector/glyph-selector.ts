
import * as ko from "knockout";
import template from "./glyph-selector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import * as opentype from "opentype.js";


@Component({
    selector: "glyph-selector",
    template: template
})
export class GlyphSelector {
    private cellCount = 100;
    public cellWidth = 50;
    public cellHeight = 50;
    public cellMarginTop = 10;
    public cellMarginBottom = 10;
    public cellMarginLeftRight = 10;
    public glyphMargin = 0;
    public pixelRatio = window.devicePixelRatio || 1;

    private pageSelected;
    public font;
    public fontScale;
    public fontSize;
    public fontBaseline;

    public glyphs: ko.ObservableArray;
    public pages: ko.ObservableArray;


    constructor() {
        this.glyphs = ko.observableArray();
        this.pages = ko.observableArray();

        this.selectGlyph = this.selectGlyph.bind(this);
    }

    @OnMounted()
    public async init(): Promise<void> {
        this.prepareGlyphList();

        const fontUrl = "http://cdn.paperbits.io/fonts/icons.woff";
        // const fontUrl = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/webfonts/fa-regular-400.ttf"
        const font = await opentype.load(fontUrl, null, { lowMemory: true });

        console.log(font);
        this.onFontLoaded(font);
    }

    private prepareGlyphList(): void {
        for (let i = 0; i < this.cellCount; i++) {
            this.glyphs().push({ id: "g" + i, index: i });
        }
    }

    private renderGlyphItem(canvas: HTMLCanvasElement, glyphIndex: number): void {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.cellWidth, this.cellHeight);

        if (glyphIndex >= this.font.numGlyphs) {
            return;
        }

        const glyph = this.font.glyphs.get(glyphIndex),
            glyphWidth = glyph.advanceWidth * this.fontScale,
            xmin = (this.cellWidth - glyphWidth) / 2,
            xmax = (this.cellWidth + glyphWidth) / 2,
            x0 = xmin;

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

        const w = this.cellWidth - this.cellMarginLeftRight * 2;
        const h = this.cellHeight - this.cellMarginTop - this.cellMarginBottom;
        const head = this.font.tables.head;
        const maxHeight = head.yMax - head.yMin;

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

    public async selectGlyph(glyphInfo: any): Promise<void> {
        if (!this.font) {
            return;
        }

        const firstGlyphIndex = this.pageSelected * this.cellCount,
            cellIndex = glyphInfo.index,
            glyphIndex = firstGlyphIndex + cellIndex;

        const glyph = this.font.glyphs.get(glyphIndex);

        console.log(glyph);

        // await this.makeFont(glyph);
    }

    public async makeFont(glyph: any): Promise<void> {
        const glyphs = [glyph]; // [notdefGlyph, aGlyph];

        const font = new opentype.Font({
            familyName: "OpenTypeSans",
            styleName: "Medium",
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: glyphs
        });

        font.download();
        // font.toArrayBuffer(); // to be upladed to storage
    }
}