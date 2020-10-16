export interface OpenTypeFontTables {
    gsub: any;
    cmap: any;
}

export interface OpenTypeFont {
    numGlyphs: number;
    glyphs: any;
    unitsPerEm: number;
    tables: OpenTypeFontTables;
    download: () => void;
    toArrayBuffer: () => ArrayBuffer;
}