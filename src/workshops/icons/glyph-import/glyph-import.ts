
import * as ko from "knockout";
import template from "./glyph-import.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import * as Utils from "@paperbits/common";
import * as opentype from "opentype.js";
import { StyleService } from "../../../styleService";
import { FontGlyph } from "../fontGlyph";
import { IconContract } from "../../../contracts";
import { IBlobStorage } from "@paperbits/common/persistence";
import { Font } from "../font";


@Component({
    selector: "glyph-import",
    template: template
})
export class GlyphImport {
    public libraries: ko.ObservableArray;

    constructor(
        private readonly styleService: StyleService,
        private readonly blobStorage: IBlobStorage
    ) {
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
        await this.makeFont(glyph);
        await this.styleService.addIcon(glyph.name, glyph.name, glyph.unicode);

        if (this.onSelect) {
            this.onSelect();
        }
    }

    public async makeFont(glyph: FontGlyph): Promise<void> {
        // const fontUrl = await this.blobStorage.getDownloadUrl("fonts/icons.ttf");

        const cccc = await this.blobStorage.downloadBlob("fonts/icons.ttf");

        let font: Font;
        const glyphs = [];

        if (cccc) {
            // font = await opentype.load(fontUrl, null, { lowMemory: true });
            font = opentype.parse(cccc);

            for (let index = 0; index < font.numGlyphs; index++) {
                glyphs.push(font.glyphs.get(index));
            }
        }

        glyphs.push(glyph);

        font = new opentype.Font({
            familyName: "MyIcons",
            styleName: "Medium",
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            glyphs: glyphs
        });

        const fontArrayBuffer: any = font.toArrayBuffer();

        await this.blobStorage.uploadBlob("fonts/icons.ttf", fontArrayBuffer, "font/ttf");

        font.download();
    }
}