
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


    constructor() {
        //

        this.glyphs2 = ko.observableArray();

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

    private pathCommandToString(cmd) {
        const str = "<strong>" + cmd.type + "</strong> " +
            ((cmd.x !== undefined) ? "x=" + cmd.x + " y=" + cmd.y + " " : "") +
            ((cmd.x1 !== undefined) ? "x1=" + cmd.x1 + " y1=" + cmd.y1 + " " : "") +
            ((cmd.x2 !== undefined) ? "x2=" + cmd.x2 + " y2=" + cmd.y2 : "");
        return str;
    }

    private contourToString(contour) {
        return '<pre class="contour">' + contour.map(function (point) {
            return '<span class="' + (point.onCurve ? "on" : "off") + 'curve">x=' + point.x + " y=" + point.y + "</span>";
        }).join("\n") + "</pre>";
    }

    private formatUnicode(unicode) {
        unicode = unicode.toString(16);
        if (unicode.length > 4) {
            return ("000000" + unicode.toUpperCase()).substr(-6);
        } else {
            return ("0000" + unicode.toUpperCase()).substr(-4);
        }
    }

    private displayGlyphData(glyphIndex): void {
        const container = document.getElementById("glyph-data");
        if (glyphIndex < 0) {
            container.innerHTML = "";
            return;
        }
        let glyph = this.font.glyphs.get(glyphIndex),
            html = "<dl>";
        html += "<dt>name</dt><dd>" + glyph.name + "</dd>";

        if (glyph.unicodes.length > 0) {
            html += "<dt>unicode</dt><dd>" + glyph.unicodes.map(this.formatUnicode).join(", ") + "</dd>";
        }
        html += "<dt>index</dt><dd>" + glyph.index + "</dd>";

        if (glyph.xMin !== 0 || glyph.xMax !== 0 || glyph.yMin !== 0 || glyph.yMax !== 0) {
            html += "<dt>xMin</dt><dd>" + glyph.xMin + "</dd>" +
                "<dt>xMax</dt><dd>" + glyph.xMax + "</dd>" +
                "<dt>yMin</dt><dd>" + glyph.yMin + "</dd>" +
                "<dt>yMax</dt><dd>" + glyph.yMax + "</dd>";
        }
        html += "<dt>advanceWidth</dt><dd>" + glyph.advanceWidth + "</dd>";
        if (glyph.leftSideBearing !== undefined) {
            html += "<dt>leftSideBearing</dt><dd>" + glyph.leftSideBearing + "</dd>";
        }
        html += "</dl>";
        if (glyph.numberOfContours > 0) {
            const contours = glyph.getContours();
            html += 'contours:<div id="glyph-contours">' + contours.map(this.contourToString).join("\n") + "</div>";
        }
        else if (glyph.isComposite) {
            html += "<br>This composite glyph is a combination of :<ul><li>" +
                glyph.components.map(function (component) {
                    if (component.matchedPoints === undefined) {
                        return "glyph " + component.glyphIndex + " at dx=" + component.dx + ", dy=" + component.dy;
                    } else {
                        return "glyph " + component.glyphIndex + " at matchedPoints=[" + component.matchedPoints + "]";
                    }
                }).join("</li><li>") + "</li></ul>";
        } 
        else if (glyph.path) {
            html += "path:<br><pre>  " + glyph.path.commands.map(this.pathCommandToString).join("\n  ") + "\n</pre>";
        }
        container.innerHTML = html;
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
        document.getElementById("p" + pageNum).className = "page-selected";
        const firstGlyph = pageNum * this.cellCount;

        for (let i = 0; i < this.cellCount; i++) {
            this.renderGlyphItem(<HTMLCanvasElement>document.getElementById("g" + i), firstGlyph + i);
        }
    }

    private pageSelect(event: any): void {
        document.getElementsByClassName("page-selected")[0].className = "";
        this.displayGlyphPage(+event.target.id.substr(1));
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

        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";
        const fragment = document.createDocumentFragment();
        const numPages = Math.ceil(font.numGlyphs / this.cellCount);

        for (let i = 0; i < numPages; i++) {
            const link = document.createElement("span");
            const lastIndex = Math.min(font.numGlyphs - 1, (i + 1) * this.cellCount - 1);
            link.textContent = i * this.cellCount + "-" + lastIndex;
            link.id = "p" + i;
            link.addEventListener("click", this.pageSelect.bind(this), false);
            fragment.appendChild(link);
            // A white space allows to break very long lines into multiple lines.
            // This is needed for fonts with thousands of glyphs.
            fragment.appendChild(document.createTextNode(" "));
        }
        pagination.appendChild(fragment);

        this.displayGlyphPage(0);

        setTimeout(() => { this.displayGlyphPage(0); }, 1000);
    }

    public cellSelect(glyph): void {
        if (!this.font) {
            return;
        }

        console.log(glyph);

        const firstGlyphIndex = this.pageSelected * this.cellCount,
            cellIndex = glyph.index,
            glyphIndex = firstGlyphIndex + cellIndex;
    }
}