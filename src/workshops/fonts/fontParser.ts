import { FontContract } from "./../../contracts/fontContract";
import * as opentype from "opentype.js";
import * as Utils from "@paperbits/common/utils";
import { IconContract } from "../../contracts";

export class FontParser {
    public static async parse(contents): Promise<FontContract> {

        let fontFamily: string;
        let fontWeight: string;
        let fontStyle: string;
        let fontIcons: IconContract[];

        try {
            const info = opentype.parse(contents);
            fontFamily = info.names.fontFamily.en;

            const regex = /(\d*)(\w*)/gm;
            const matches = regex.exec(info.names.fontSubfamily.en);

            /* Normal weight is equivalent to 400. Bold weight is quivalent to 700. */
            fontWeight = matches[1] || "400";
            fontStyle = matches[2] || "normal";

            // Glyphs
            fontIcons = this.fontGlyphsIntoIconContracts(fontFamily, info.glyphs);
        }
        catch (error) {
            fontFamily = "Font";
            fontWeight = "normal";
            fontStyle = "normal";
        }

        const identifier = Utils.guid();

        const fontContract: FontContract = {
            key: `fonts/${identifier}`,
            family: fontFamily,
            displayName: fontFamily,
            category: null,
            version: null,
            lastModified: (new Date()).toISOString(),
            variants: [{
                weight: fontWeight,
                style: fontStyle.toLowerCase(),
                sourceKey: identifier
            }],
            icons: fontIcons
        };

        return fontContract;
    }

    private static fontGlyphsIntoIconContracts(fontFamily: string, glyphSet: opentype.GlyphSet): IconContract[] | null {
        if (!glyphSet || glyphSet.length === 0) {
            console.log("No glyphs found in this font.");
            return null;
        }

        // const glyphs = glyphSet.glyphs;
        const table: IconContract[]  = [];
        let glyph;

        for (let i = 0; i < glyphSet.length - 1; i++) {
            glyph = glyphSet.get(i);
            if (!glyph.unicode) {
                continue;
            }

            table.push({
                name: glyph.name,
                fontFamily: fontFamily,
                unicode: glyph.unicode
            });
        }

        return table;
    }
}