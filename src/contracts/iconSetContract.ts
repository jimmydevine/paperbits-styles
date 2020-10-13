import { Bag } from "@paperbits/common";
import { GlyphContract } from "./glyphContract";


export interface IconSetContract {
    /**
     * Icon font key.
     */
    fontKey: string;

    /**
     * Bag of glyph definitions.
     */
    glyphs: Bag<GlyphContract>;
}
