
import * as ko from "knockout";
import template from "./glyph-import.html";
import { Component, Event } from "@paperbits/common/ko/decorators";
import { StyleService } from "../../../styleService";
import { OpenTypeFontGlyph } from "../../../openType/openTypeFontGlyph";
import { IBlobStorage } from "@paperbits/common/persistence";


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
                sourceUrl: "https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/3.0.2/iconfont/MaterialIcons-Regular.ttf"
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

    public async addIcon(glyph: OpenTypeFontGlyph): Promise<void> {
        await this.styleService.addIcon(glyph);

        if (this.onSelect) {
            this.onSelect();
        }
    }
}