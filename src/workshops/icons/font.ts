export interface Font {
    numGlyphs: number;
    glyphs: any;
    unitsPerEm: number;
    tables: any;
    download: () => void;
    toArrayBuffer: () => ArrayBuffer;
}