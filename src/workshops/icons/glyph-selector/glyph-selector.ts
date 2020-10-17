
import * as ko from "knockout";
import * as opentype from "opentype.js";
import template from "./glyph-selector.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { OpenTypeFontGlyph } from "../../../openType/openTypeFontGlyph";
import { OpenTypeFont } from "../../../openType/openTypeFont";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";

@Component({
    selector: "glyph-selector",
    template: template
})
export class GlyphSelector {
    public font: OpenTypeFont;
    public glyphs: ko.ObservableArray;
    public allGlyphs: any[];
    public pages: ko.ObservableArray;

    constructor() {
        this.glyphs = ko.observableArray([]);
        this.allGlyphs = [];
        this.pages = ko.observableArray();
        this.fontSource = ko.observable();
        this.searchPattern = ko.observable("");
        this.selectGlyph = this.selectGlyph.bind(this);
    }

    @Param()
    public fontSource: ko.Observable<string>;

    @Param()
    public searchPattern: ko.Observable<string>;

    @Event()
    public onSelect: (glyph: any) => void;

    @OnMounted()
    public async init(): Promise<void> {
        const fontUrl = this.fontSource();
        const font = await opentype.load(fontUrl, null, { lowMemory: false });
        this.font = font;

        this.parseLigatures(font);
        const searchPattern = this.searchPattern();

        for (let index = 0; index < this.font.numGlyphs; index++) {
            const glyph: OpenTypeFontGlyph = this.font.glyphs.get(index);

            if (!glyph.unicode || glyph.unicode.toString().length < 4) {
                continue;
            }

            if (!glyph.name.toLowerCase().includes(searchPattern.toLowerCase())) {
                continue;
            }

            this.allGlyphs.push({ index: index, name: glyph.name });
        }

        this.searchPattern
            .extend(ChangeRateLimit)
            .subscribe(this.searchIcons);

        this.searchIcons();
    }

    private searchIcons(): void {
        const searchPattern = this.searchPattern().toLowerCase();

        const filteredGlyphs = this.allGlyphs.filter(glyph => glyph.name.toLowerCase().includes(searchPattern));

        this.glyphs(filteredGlyphs);
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

    public parseLigatures(font: OpenTypeFont): void {
        if (!font.tables.gsub) {
            return;
        }

        const glyphIndexMap = font.tables.cmap.glyphIndexMap;
        const reverseGlyphIndexMap = {};

        Object.keys(glyphIndexMap).forEach((key: string) => {
            const value = glyphIndexMap[key];
            reverseGlyphIndexMap[value] = key;
        });

        font.tables.gsub.lookups.forEach((lookup) => {
            lookup.subtables.forEach((subtable) => {
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
                            const name = String.fromCharCode(coverage1) + components.join("");
                            const glyph = this.font.glyphs.get(ligature.ligGlyph);
                            glyph.name = name;
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

                            const name = coverage2[i] + components.join("");
                            const glyph = this.font.glyphs.get(ligature.ligGlyph);
                            glyph.name = name;
                        });
                    });
                }
            });
        });
    }
}