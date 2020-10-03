export interface FontGyphPoint {
    lastPointOfContour: boolean;
    onCurve: boolean;
    x: number;
    y: number;
}

export interface FontGlyph {
    name: string;
    index: number;
    unicode: number;
    advanceWidth: number;
    points: FontGyphPoint[];
}