import { OpenTypeFontGlyphPoint } from "./openTypeFontGlyphPoint";

export interface OpenTypeFontGlyph {
    name: string;
    index: number;
    unicode: number;
    advanceWidth: number;
    points: OpenTypeFontGlyphPoint[];
}
