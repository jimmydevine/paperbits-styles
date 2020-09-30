import { PrimitiveContract } from "@paperbits/common/styles";

/**
 * Icon metadata.
 */
export interface IconContract extends PrimitiveContract {
    /**
     * Glyph unicode identifier in the icon font.
     */
    unicode: number;

    /**
     * Glyph name in the icon font.
     */
    name: string;
}