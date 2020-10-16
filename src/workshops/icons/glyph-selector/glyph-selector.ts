
import * as ko from "knockout";
import * as opentype from "opentype.js";
import template from "./glyph-selector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { OpenTypeFontGlyph } from "../../../contracts/fontGlyph";
import { OpenTypeFont } from "../../../contracts/openTypeFont";

@Component({
    selector: "glyph-selector",
    template: template
})
export class GlyphSelector {
    public font: OpenTypeFont;
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
        const font = await opentype.load(fontUrl, null, { lowMemory: false });
        //   font.download();

        this.font = font;

        // this.parseLigatures(font);

        for (let index = 0; index < this.font.numGlyphs; index++) {
            const glyph: OpenTypeFontGlyph = this.font.glyphs.get(index);

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

    public parseLigatures(font: any): void {
        const glyphIndexMap = font.tables.cmap.glyphIndexMap;
        const reverseGlyphIndexMap = {};

        Object.keys(glyphIndexMap).forEach((key) => {
            const value = glyphIndexMap[key];
            reverseGlyphIndexMap[value] = key;
        });

        font.tables.gsub.lookups.forEach((lookup) => {
            lookup.subtables.forEach((subtable) => {
                subtable.ligatureSets.forEach((set) => {

                    if (subtable.coverage.format === 1) {
                        subtable.ligatureSets.forEach((set, i) => {
                            set.forEach((ligature) => {
                                let coverage1 = subtable.coverage.glyphs[i];
                                coverage1 = reverseGlyphIndexMap[coverage1];
                                coverage1 = parseInt(coverage1);
                                const components = ligature.components.map((component) => {
                                    component = reverseGlyphIndexMap[component];
                                    component = parseInt(component);
                                    return String.fromCharCode(component);
                                });
                                console.log(String.fromCharCode(coverage1), components.join(""), ligature.ligGlyph);
                            });
                        });
                    }
                    else {
                        subtable.ligatureSets.forEach((set, i) => {
                            set.forEach((ligature) => {
                                const coverage2 = [];
                                subtable.coverage.ranges.forEach((coverage) => {
                                    for (let i = coverage.start; i <= coverage.end; i++) {
                                        let character = reverseGlyphIndexMap[i];
                                        character = parseInt(character);
                                        coverage2.push(String.fromCharCode(character));
                                    }
                                });

                                const components = ligature.components.map((component) => {
                                    component = reverseGlyphIndexMap[component];
                                    component = parseInt(component);
                                    return String.fromCharCode(component);
                                });
                                console.log(coverage2[i] + components.join(""), ligature.ligGlyph);
                            });
                        });
                    }

                });
            });
        });
    }
}