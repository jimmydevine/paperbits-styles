import { StyleSheet } from "@paperbits/common/styles";
import { EventManager } from "@paperbits/common/events";
import { JssCompiler } from "./jssCompiler";


export class StyleManager {
    private localStyleSheet: StyleSheet;
    private localStyleCss: string;
    private globalStyleSheet: StyleSheet;
    private globalStyleCss: string;

    constructor(private readonly eventManager: EventManager) {
        // TODO
    }

    public setLocalStyles(styleSheet: StyleSheet): void {
        this.globalStyleSheet = styleSheet;

        const compiler = new JssCompiler();
        this.localStyleCss = compiler.styleSheetToCss(styleSheet);
    }

    public getLocalStyles(): StyleSheet {
        return this.localStyleSheet;
    }

    public getLocalStylesCss(): string {
        return this.localStyleCss;
    }

    public setGlobalStyles(styleSheet: StyleSheet): void {
        this.localStyleSheet = styleSheet;

        const compiler = new JssCompiler();
        this.globalStyleCss = compiler.styleSheetToCss(styleSheet);

        this.eventManager.dispatchEvent("onStyleChange");
    }

    public getGlobalStyles(): StyleSheet {
        return this.globalStyleSheet;
    }

    public getGlobalStylesCss(): string {
        return this.globalStyleCss;
    }

    // public removeLocalStyle(key: string): void {

    // }
}