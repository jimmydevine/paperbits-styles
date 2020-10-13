export interface OpenTypeFontGlyphPoint {
    lastPointOfContour: boolean;
    onCurve: boolean;
    x: number;
    y: number;
}

export interface OpenTypeFontGlyph {
    name: string;
    index: number;
    unicode: number;
    advanceWidth: number;
    points: OpenTypeFontGlyphPoint[];
}