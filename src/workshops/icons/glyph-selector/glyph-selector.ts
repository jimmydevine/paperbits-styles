
import * as ko from "knockout";
import template from "./glyph-selector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import * as opentype from "opentype.js";
import { Font } from "../font";
import { FontGlyph, FontGlyphPoint } from "../fontGlyph";


@Component({
    selector: "glyph-selector",
    template: template
})
export class GlyphSelector {
    public font: Font;
    public glyphs: ko.ObservableArray;
    public pages: ko.ObservableArray;

    constructor() {
        this.glyphs = ko.observableArray([]);
        this.pages = ko.observableArray();
        this.fontSource = ko.observable();
        this.selectGlyph = this.selectGlyph.bind(this);
    }

    @Param()
    public fontSource: ko.Observable<string>;

    @Event()
    public onSelect: (glyph: any) => void;

    @OnMounted()
    public async init(): Promise<void> {
        const fontUrl = this.fontSource();
        const font = await opentype.load(fontUrl, null, { lowMemory: true });

        this.font = font;
        
        for (let index = 0; index < this.font.numGlyphs; index++) {
            const glyph: FontGlyph = this.font.glyphs.get(index);

            if (!glyph.unicode || glyph.unicode.toString().length < 4) {
                continue;
            }

            this.glyphs.push({ index: index });
        }
    }

    public async selectGlyph(glyphInfo: any): Promise<void> {
        if (!this.font) {
            return;
        }

        const glyph = this.font.glyphs.get(glyphInfo.index);

        if (this.onSelect) {
            this.onSelect(glyph);
        }
    }
}