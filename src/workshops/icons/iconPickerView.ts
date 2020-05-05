import * as ko from "knockout";
import template from "./iconPickerView.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { FontContract, IconContract } from "../../contracts";
import { StyleService } from "../../styleService";
import { Glyph } from "opentype.js";
import {FontFace, Style, StyleCompiler, StyleRule, StyleSheet} from "@paperbits/common/styles";
import {FontsStylePlugin} from "../../plugins";

interface IconWithStyleSheet {
    icon: IconContract;
    styleSheet: StyleSheet;
}

@Component({
    selector: "icon-picker-view",
    template: template
})
export class IconPickerView {

    @Param()
    public selectedIcon: ko.Observable<string>;

    @Event()
    public readonly onSelect: (icon: IconContract) => void;

    public compiledFontStyles: ko.Observable<string>;

    public fonts: ko.ObservableArray<FontContract>;

    public readonly icons: ko.ObservableArray<IconWithStyleSheet>;

    constructor(
        private readonly styleService: StyleService,
        private readonly styleCompiler: StyleCompiler
    ) {
        this.loadIcons = this.loadIcons.bind(this);
        this.selectedIcon = ko.observable();
        this.compiledFontStyles = ko.observable();
        this.fonts = ko.observableArray();
        this.icons = ko.observableArray();
    }

    @OnMounted()
    public async loadIcons(): Promise<void> {

        const createStyleSheetForIcon = (icon: IconContract): StyleSheet => {
            const iconStyleName = `${icon.name}`;
            const style: Style = new Style(iconStyleName);
            const iconStyleRules: StyleRule[] = [
                new StyleRule("content", `${icon.unicode}`)
//                new StyleRule("font-family", icon.fontFamily)
            ];
            style.addRules(iconStyleRules);

            const styleSheet = new StyleSheet();
            styleSheet.styles.push(style);
            return styleSheet;
        };

        function formatUnicode(unicode: number): string {
            const unicodeStr = unicode.toString(16);
            if (unicodeStr.length > 4) {
                return ("000000" + unicodeStr.toLowerCase()).substr(-6);
            } else {
                return ("0000" + unicodeStr.toLowerCase()).substr(-4);
            }
        }
        const styles = await this.styleCompiler.getFontsStylesCss();
        this.compiledFontStyles(styles);
        const fonts = await this.styleService.getVariations<FontContract>("iconFonts");

        const fontFaces = await this.styleCompiler.getIconFontFaces();
        this.fonts(fonts);
        let iconStyles = `
        .faIcon::before {
            display: inline-block;
            font-style: normal;
            font-variant: normal;
            text-rendering: auto;
            -webkit-font-smoothing: antialiased;
        }
        `;
        const icons = [];
        if (this.fonts().length > 0) {
            for (const font of this.fonts()) {
            // for (let i = 0; i < 5; i++) {
            //     const font = this.fonts()[i];
                // const themeContract = await this.styleService.getStyles();
                // const fontsPlugin = new FontsStylePlugin(this.mediaPermalinkResolver, themeContract);
                // const fontFaces = await fontsPlugin.contractToFontFaces();
                if (font.icons && font.icons.length > 0) {
                    for (const icon of font.icons) {
                        iconStyles += `
                        .${icon.name}::before {
                            font-family: "${font.family}", serif;
                            font-weight: 400;
                            content: "\\${formatUnicode(icon.unicode)}"; 
                        }
                        `;
                        icons.push({
                            icon: icon,
                            styleSheet: createStyleSheetForIcon(icon)
                        });
                    }
                }
            }
        }
        this.icons(icons);
        this.compiledFontStyles(styles + "\n" + iconStyles);

        console.log("Icons are loaded", this.icons());
    }

    public drawIcon(glyph: Glyph): void {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        glyph.draw(ctx);
        const mySpan = document.getElementById("mySpanId");
    }

    public selectIcon(icon: IconContract): void {
        console.log(icon.name + " is selected");
    }
}
