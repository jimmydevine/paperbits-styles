
import * as ko from "knockout";
import template from "./glyph-import.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common";
import * as opentype from "opentype.js";
import { StyleService } from "../../../styleService";
import { FontGlyph } from "../fontGlyph";
import { IconContract } from "../../../contracts";


@Component({
    selector: "glyph-import",
    template: template
})
export class GlyphImport {
    public libraries: ko.ObservableArray;

    constructor(private readonly styleService: StyleService) {
        this.libraries = ko.observableArray([
            {
                displayName: "Font Awesome icons",
                sourceUrl: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/webfonts/fa-regular-400.ttf"
            },
            {
                displayName: "Material Design icons",
                sourceUrl: " https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/3.0.2/iconfont/MaterialIcons-Regular.ttf"
            },

            // {
            //     displayName: "Nucleo",
            //     sourceUrl: "http://cdn.paperbits.io/fonts/icons.woff"
            // }

            // https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/3.0.2/iconfont/MaterialIcons-Regular.ttf
        ]);
    }

    @Event()
    public onSelect: () => void;

    public async addIcon(glyph: FontGlyph): Promise<void> {
        await this.styleService.addIcon(glyph.name, glyph.name, glyph.unicode);

        if (this.onSelect) {
            this.onSelect();
        }
    }

    public async makeFont(glyph: FontGlyph): Promise<void> {
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