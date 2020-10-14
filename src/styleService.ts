import * as _ from "lodash";
import * as Utils from "@paperbits/common/utils";
import * as Objects from "@paperbits/common/objects";
import * as opentype from "opentype.js";
import { IBlobStorage, IObjectStorage } from "@paperbits/common/persistence";
import { ThemeContract, ColorContract, ShadowContract, LinearGradientContract, GlyphContract } from "./contracts";
import { StyleItem } from "./models/styleItem";
import { ComponentStyle } from "./contracts/componentStyle";
import { StyleHandler, VariationContract } from "@paperbits/common/styles";
import { IconsFontBlobKey, StylePrimitives } from "./constants";
import { OpenTypeFont } from "./contracts/openTypeFont";
import { OpenTypeFontGlyph } from "./contracts/fontGlyph";


const stylesPath = "styles";

export class StyleService {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly blobStorage: IBlobStorage,
        private readonly styleHandlers: StyleHandler[]
    ) { }

    public async getStyles(): Promise<ThemeContract> {
        const stylesObject = await this.objectStorage.getObject<ThemeContract>(stylesPath);

        if (!stylesObject) {
            throw new Error("Data doesn't contain styles.");
        }

        this.styleHandlers.forEach(styleHandler => {
            if (styleHandler.migrate) {
                styleHandler.migrate(stylesObject.components[styleHandler.key]);
            }

            if (stylesObject.components[styleHandler.key]) {
                return;
            }

            stylesObject.components[styleHandler.key] = styleHandler.getDefaultStyle();
        });

        return stylesObject;
    }

    public async getStyleByKey(styleKey: string): Promise<any> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        if (!StylePrimitives.some(x => styleKey.startsWith(`${x}/`))) {
            throw new Error(`Unknown style premitive: "${styleKey}".`);
        }

        const styles = await this.getStyles();

        // TODO: If no style found, try to take default one
        const style = Objects.getObjectAt<any>(styleKey, styles);

        if (style) {
            return style;
        }

        const defaultStyle = this.styleHandlers
            .map(handler => handler.getDefaultStyle(styleKey))
            .find(x => !!x);

        if (defaultStyle) {
            return defaultStyle;
        }

        throw new Error(`Neither style nor default can be fetched by key "${styleKey}".`);
    }

    public async addColorVariation(variationName: string): Promise<ColorContract> {
        const styles = await this.getStyles();
        const newVariation: any = Objects.clone(styles["colors"]["default"]);
        newVariation.key = `colors/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        Objects.setValue(`colors/${variationName}`, styles, newVariation);

        this.updateStyles(styles);

        return newVariation;
    }

    public async addGradientVariation(variationName: string): Promise<LinearGradientContract> {
        const styles = await this.getStyles();
        const gradient: LinearGradientContract = {
            key: `gradients/${variationName}`,
            displayName: "Gradient",
            direction: "45deg",
            colorStops: [{
                color: "#87E0FD",
                length: 0
            },
            {
                color: "#05ABE0",
                length: 100
            }]
        };
        gradient.displayName = "< Unnamed >";
        Objects.setValue(`gradients/${variationName}`, styles, gradient);

        this.updateStyles(styles);

        return gradient;
    }

    public async addShadowVariation(variationName: string): Promise<ShadowContract> {
        const styles = await this.getStyles();
        const newVariation: any = { blur: 1, spread: 1, color: "rgba(0, 0, 0, 0.1)", inset: false, offsetX: 1, offsetY: 1 };
        newVariation.key = `shadows/${variationName}`;
        newVariation.displayName = "< Unnamed >";

        Objects.setValue(`shadows/${variationName}`, styles, newVariation);

        this.updateStyles(styles);

        return newVariation;
    }

    private rewriteVariationKeysRecursively(variation: Object, parentKey: string): void {
        variation["key"] = parentKey;

        if (!variation["components"]) {
            return;
        }

        Object.keys(variation["components"]).forEach(componentKey => {
            const subComponent = variation["components"][componentKey];

            Object.keys(subComponent).forEach(subComponentVariationKey => {
                const subComponentVariation = subComponent[subComponentVariationKey];
                const key = `${parentKey}/components/${componentKey}/${subComponentVariationKey}`;

                this.rewriteVariationKeysRecursively(subComponentVariation, key);
            });
        });
    }

    public async addComponentVariation(componentName: string, variationName: string, snippet?: ComponentStyle): Promise<string> {
        const styles = await this.getStyles();

        const defaultVariation = snippet.variations.find(x => x.key === `components/${componentName}/default`);

        if (!defaultVariation) {
            throw new Error(`Default variation for component "${componentName}" not found.`);
        }

        const variation: StyleItem = Objects.clone(defaultVariation);
        const key = `components/${componentName}/${variationName}`;

        this.rewriteVariationKeysRecursively(variation, key);

        variation.key = key;
        variation.displayName = "< Unnamed >";
        variation.category = "appearance";

        styles.components[componentName][variationName] = variation;

        this.updateStyles(styles);

        return variation.key;
    }

    public async addTextStyleVariation(variationName: string): Promise<VariationContract> {
        const styles = await this.getStyles();

        const variation: VariationContract = {
            key: `globals/body/${variationName}`,
            displayName: "< Unnamed >"
        };

        styles.globals["body"][variationName] = variation;

        this.updateStyles(styles);

        return variation;
    }

    public async updateStyles(updatedStyles: ThemeContract): Promise<void> {
        this.objectStorage.updateObject(stylesPath, updatedStyles);
    }

    public async mergeStyles(appendStyles: ThemeContract): Promise<void> {
        const styles = await this.getStyles();
        await this.updateStyles(_.merge(styles, appendStyles));
    }

    public async updateStyle(style: VariationContract): Promise<void> {
        if (!style) {
            throw new Error("Style cannot be empty.");
        }

        if (!style.key) {
            throw new Error("Style doesn't have key.");
        }

        const styles = await this.getStyles();

        Objects.setValue(style.key, styles, style);

        await this.updateStyles(styles);
    }

    public async getVariations<TVariation>(categoryName: string, subCategoryName?: string): Promise<TVariation[]> {
        if (!categoryName) {
            throw new Error(`Parameter "categoryName" not specified.`);
        }

        const styles = await this.getStyles();

        let categoryStyles: { [x: string]: any; };

        if (subCategoryName) {
            categoryStyles = styles[categoryName][subCategoryName];
        }
        else {
            categoryStyles = styles[categoryName];
        }

        const category = Object.keys(categoryStyles);
        const states = this.getAllowedStates(categoryStyles);

        const variations = category.map(variationName => {
            const variationContract = categoryStyles[variationName];

            if (states && variationName !== "default") {
                variationContract["allowedStates"] = states;
            }

            return variationContract;
        });

        return variations;
    }

    public getAllowedStates(styles: any): [] {
        const states = styles["default"]["allowedStates"];
        if (states) {
            return states;
        }
        return undefined;
    }

    public async getComponentVariations(componentName: string): Promise<any[]> {
        if (!componentName) {
            throw new Error(`Parameter "componentName" not specified.`);
        }

        const styles = await this.getStyles();
        const componentStyles = styles.components[componentName];

        const states = this.getAllowedStates(componentStyles);

        const variations = Object.keys(componentStyles).map(variationName => {
            const variationContract = componentStyles[variationName];
            if (states && variationName !== "default") {
                variationContract.allowedStates = states;
            }
            return variationContract;
        });

        return variations;
    }

    public async removeStyle(styleKey: string): Promise<void> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        const styles = await this.getStyles();
        Objects.deleteNodeAt(`${styleKey}`, styles);
        this.objectStorage.updateObject(`${stylesPath}`, styles);
    }

    public async checkStyleIsInUse(styleKey: string): Promise<any[]> {
        if (!styleKey) {
            throw new Error(`Parameter "styleKey" not specified.`);
        }

        const styles = await this.getStyles();
        const style = Objects.getObjectAt(styleKey, styles);

        const referencedStyles = Utils.findNodesRecursively((node: any) => {
            let found = false;

            if (node !== style && node.displayName) {
                const res = Utils.findNodesRecursively((styleNode: any) => {
                    let f = false;
                    Object.keys(styleNode).forEach(y => {
                        if (styleNode[y] === styleKey) {
                            f = true;
                        }
                    });
                    return f;
                }, node);

                if (res.length > 0) {
                    found = true;
                }
            }

            return found;
        }, styles);

        return referencedStyles;
    }


    public async makeFont(styles: ThemeContract, newGlyph: OpenTypeFontGlyph): Promise<void> {
        const fontUrl = styles.fonts["icons"].variants[0].file;

        let font: OpenTypeFont;

        const glyphs = [];
        const advanceWidths = []; // capturing advanceWidths.

        if (fontUrl) {
            font = await opentype.load(fontUrl, null, { lowMemory: true });

            for (let index = 0; index < font.numGlyphs; index++) {
                const glyphInFont = font.glyphs.get(index);
                glyphs.push(glyphInFont);
                advanceWidths.push(glyphInFont.advanceWidth);
            }
        }
        else {
            const notdefGlyph = new opentype.Glyph({
                name: ".notdef",
                unicode: 0,
                advanceWidth: 650,
                path: new opentype.Path()
            });

            glyphs.push(notdefGlyph);
            advanceWidths.push(notdefGlyph.advanceWidth);
        }

        if (!newGlyph.name) {
            newGlyph.name = "Icon";
        }

        glyphs.push(newGlyph);
        advanceWidths.push(newGlyph.advanceWidth);

        font = new opentype.Font({
            familyName: "MyIcons",
            styleName: "Medium",
            unitsPerEm: 400,
            ascender: 800,
            descender: -200,
            glyphs: glyphs
        });

        // Restoring advanceWidth
        glyphs.forEach((x, index) => x.advanceWidth = advanceWidths[index]);

        const fontArrayBuffer = font.toArrayBuffer();

        await this.blobStorage.uploadBlob(IconsFontBlobKey, new Uint8Array(fontArrayBuffer), "font/ttf");

        const downloadUrl = await this.blobStorage.getDownloadUrl(IconsFontBlobKey);
        console.log(downloadUrl);

        styles.fonts["icons"].variants[0].file = downloadUrl;

        // font.download();
    }

    public async addIcon(glyph: OpenTypeFontGlyph): Promise<void> {
        const styles = await this.getStyles();

        await this.makeFont(styles, glyph);

        const identifier = Utils.identifier();
        const icon: GlyphContract = {
            key: `icons/${identifier}`,
            name: name,
            displayName: glyph.name,
            unicode: glyph.unicode
        };

        styles.icons.glyphs[identifier] = icon;

        await this.updateStyles(styles);
    }
}