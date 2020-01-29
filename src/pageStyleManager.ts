import { StyleSheet, StyleModel } from "@paperbits/common/styles";
import { JssCompiler } from "./jssCompiler";

export class PageStyleManager {
    private cssStyleSheet: CSSStyleSheet;

    constructor(private readonly compiler: JssCompiler) {

    }

    public attachStyleSheet(): void {

    }

    public setGlobalStyle(styleSheet: StyleSheet): void {
        // this.compiler.styleSheetToGlobalCss()
    }

    public setLocalStyle(styleModel: StyleModel): void {
        const css = styleModel.css;
        // this.cssStyleSheet.

        const index = this.cssStyleSheet.rules.length;
        this.cssStyleSheet.insertRule(css, index);

        const rule = this.cssStyleSheet.rules[index];
        rule["key"] = styleModel.key;
    }

    public removeLocalStyle(key: string): void {
        const rules: CSSRule[] = Array.prototype.slice.call(this.cssStyleSheet.rules);
        const ruleIndex = rules.findIndex(x => x["key"] === key);

        this.cssStyleSheet.removeRule(ruleIndex);
    }
}