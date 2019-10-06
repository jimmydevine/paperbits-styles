import * as ko from "knockout";
import * as Utils from "@paperbits/common";
import * as _ from "lodash";
import template from "./styleGuide.html";
import { IEventManager } from "@paperbits/common/events";
import { Component, OnMounted, OnDestroyed } from "@paperbits/common/ko/decorators";
import { IStyleGroup } from "@paperbits/common/styles";
import { IView, IViewManager, ViewManagerMode, IHighlightConfig, IContextCommandSet } from "@paperbits/common/ui";
import { StyleService } from "../styleService";
import { FontContract, ColorContract, ShadowContract, LinearGradientContract } from "../contracts";
import { StyleItem } from "../models/styleItem";
import { ComponentStyle } from "../contracts/componentStyle";

@Component({
    selector: "style-guide",
    template: template,
    injectable: "styleGuide"
})
export class StyleGuide {
    private activeHighlightedElement: HTMLElement;
    private scrolling: boolean;
    private scrollTimeout: any;
    private pointerX: number;
    private pointerY: number;
    private actives: object = {};
    private ownerDocument: Document;

    public styles: ko.Observable<any>;
    public textBlocks: ko.ObservableArray<any>;
    public buttons: ko.ObservableArray<any>;
    public cards: ko.ObservableArray<any>;
    public pictures: ko.ObservableArray<any>;
    public videoPlayers: ko.ObservableArray<any>;
    public fonts: ko.ObservableArray<FontContract>;
    public colors: ko.ObservableArray<ColorContract>;
    public shadows: ko.ObservableArray<ShadowContract>;
    public gradients: ko.ObservableArray<LinearGradientContract>;
    public textStyles: ko.ObservableArray<any>;
    public navBars: ko.ObservableArray<any>;
    public uiComponents: ko.ObservableArray<ComponentStyle>;

    constructor(
        private readonly styleService: StyleService,
        private readonly viewManager: IViewManager,
        private readonly eventManager: IEventManager,
        private readonly styleGroups: IStyleGroup[]
    ) {
        this.styles = ko.observable();
        this.colors = ko.observableArray([]);
        this.shadows = ko.observableArray([]);
        this.gradients = ko.observableArray([]);
        this.fonts = ko.observableArray([]);
        this.buttons = ko.observableArray([]);
        this.cards = ko.observableArray([]);
        this.pictures = ko.observableArray([]);
        this.videoPlayers = ko.observableArray([]);
        this.textBlocks = ko.observableArray([]);
        this.textStyles = ko.observableArray([]);
        this.navBars = ko.observableArray([]);
        this.uiComponents = ko.observableArray([]);
    }

    @OnMounted()
    public async loadStyles(): Promise<void> {
        this.applyChanges();
        this.ownerDocument = this.viewManager.getHostDocument();
        this.attach();
    }

    public async addFonts(): Promise<void> {
        const view: IView = {
            heading: "Fonts",
            component: {
                name: "google-fonts",
                params: {
                    onSelect: () => {
                        this.viewManager.closeView();
                        this.eventManager.dispatchEvent("onStyleChange");
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
    }

    public async removeStyle(contract: any): Promise<void> {
        await this.styleService.removeStyle(contract.key);
        this.applyChanges();
    }

    public async addColor(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        const addedColorKey = await this.styleService.addColorVariation(variationName);
        this.applyChanges();

        const color = await this.styleService.getStyleByKey(addedColorKey);
        this.selectColor(color);
    }

    public async addShadow(): Promise<void> {
        const variationName = `${Utils.identifier()}`;
        const addedKey = await this.styleService.addShadowVariation(variationName);
        this.applyChanges();

        const shadow = await this.styleService.getStyleByKey(addedKey);
        this.selectShadow(shadow);
    }

    public async removeColor(color: ColorContract): Promise<void> {
        await this.styleService.removeStyle(color.key);
        this.applyChanges();
    }

    public selectColor(color: ColorContract): boolean {
        const view: IView = {
            heading: "Color",
            component: {
                name: "color-editor",
                params: {
                    selectedColor: color,
                    onSelect: async (color: ColorContract) => {
                        await this.styleService.updateStyle(color);
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public selectShadow(shadow: ShadowContract): boolean {
        const view: IView = {
            heading: "Shadow",
            component: {
                name: "shadow-editor",
                params: {
                    selectedShadow: shadow,
                    onSelect: async (shadow: ShadowContract) => {
                        await this.styleService.updateStyle(shadow);
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public selectStyle(style: any): boolean {
        const view: IView = {
            heading: style.displayName,
            component: {
                name: "style-editor",
                params: {
                    elementStyle: style,
                    onUpdate: () => {
                        this.styleService.updateStyle(style);
                        this.applyChanges();
                    }
                }
            },
            resize: "vertically horizontally"
        };

        this.viewManager.openViewAsPopup(view);
        return true;
    }

    public async addTextStyleVariation(): Promise<void> {
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.
        const addedStyleKey = await this.styleService.addTextStyleVariation(variationName);
        const addedStyle = await this.styleService.getStyleByKey(addedStyleKey);
        this.selectStyle(addedStyle);

        this.applyChanges();
    }

    public async onSnippetSelected(snippet: StyleItem): Promise<void> {
        console.log("Snippet selected: ", snippet);
        await this.styleService.mergeStyles(snippet.stylesConfig);
        await this.openInEditor(snippet.stylesType.split("/").pop(), snippet);
    }

    public async openInEditor(componentName: string, snippet?: any): Promise<void> {
        const variationName = `${Utils.identifier().toLowerCase()}`; // TODO: Replace name with kebab-like name.
        const addedStyleKey = await this.styleService.addComponentVariation(componentName, variationName, snippet);
        const addedStyle = await this.styleService.getStyleByKey(addedStyleKey);

        this.selectStyle(addedStyle);

        this.applyChanges();
    }

    public async applyChanges(): Promise<void> {
        const styles = await this.styleService.getStyles();

        const fonts = Object.values(styles.fonts);
        this.fonts(fonts);

        const colors = Object.values(styles.colors);
        this.colors(this.sortByDisplayName(colors));

        const gradients = Object.values(styles.gradients);
        this.gradients(this.sortByDisplayName(gradients));

        const shadows = Object.values(styles.shadows).filter(x => x.key !== "shadows/none");
        this.shadows(this.sortByDisplayName(shadows));

        const textStylesVariations = await this.styleService.getVariations("globals", "body");
        this.textStyles(this.sortByDisplayName(textStylesVariations));

        const components = await this.getComponentsStyles();
        this.uiComponents(components);


        this.styles(styles);
    }

    public async getComponentsStyles(): Promise<ComponentStyle[]> {
        const styles = await this.styleService.getStyles();

        const result = Object.keys(styles.components)
            .map<ComponentStyle>(componentName => {
                const groupMetadata = this.styleGroups.find(item => item.name === `components_${componentName}`);

                if (!groupMetadata || !groupMetadata.styleTemplate) {
                    // console.warn("metadata not found for component:", componentName);
                    return undefined;
                }

                const componentStyles = styles.components[componentName];
                const states = this.styleService.getAllowedStates(componentStyles);

                const variations = Object.keys(componentStyles).map(variationName => {
                    const variationContract = componentStyles[variationName];

                    if (states && variationName !== "default") {
                        variationContract["allowedStates"] = states;
                    }

                    return variationContract;
                });

                return {
                    name: componentName,
                    displayName: groupMetadata.groupName,
                    variations: variations,
                    itemTemplate: groupMetadata.styleTemplate
                };
            })
            .filter(item => item !== undefined);

        return result;
    }

    private sortByDisplayName(items: any[]): any[] {
        return _.sortBy(items, ["displayName"]);
    }

    public keyToClass(key: string): string {
        return Utils.camelCaseToKebabCase(key).replace("/", "-");
    }















    public attach(): void {
        // Firefox doesn't fire "mousemove" events by some reason
        this.ownerDocument.addEventListener("mousemove", this.onPointerMove.bind(this), true);
        this.ownerDocument.addEventListener("scroll", this.onWindowScroll.bind(this));
        this.ownerDocument.addEventListener("mousedown", this.onPointerDown, true);
        // this.ownerDocument.addEventListener("keydown", this.onKeyDown);
    }

    @OnDestroyed()
    public dispose(): void {
        this.ownerDocument.removeEventListener("mousemove", this.onPointerMove.bind(this), true);
        this.ownerDocument.removeEventListener("scroll", this.onWindowScroll.bind(this));
        this.ownerDocument.removeEventListener("mousedown", this.onPointerDown, true);
        // this.ownerDocument.removeEventListener("keydown", this.onKeyDown);
    }

    private onWindowScroll(): void {
        if (this.viewManager.mode === ViewManagerMode.dragging || this.viewManager.mode === ViewManagerMode.pause) {
            return;
        }

        if (!this.scrolling) {
            this.viewManager.clearContextualEditors();
        }

        this.scrolling = true;

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = setTimeout(this.resetScrolling.bind(this), 400);
    }

    private resetScrolling(): void {
        this.scrolling = false;
        this.renderHighlightedElements();
    }

    private renderHighlightedElements(): void {
        if (this.scrolling || (this.viewManager.mode !== ViewManagerMode.selecting && this.viewManager.mode !== ViewManagerMode.selected)) {
            return;
        }

        const elements = Utils.elementsFromPoint(this.ownerDocument, this.pointerX, this.pointerY);

        this.rerenderEditors(elements);
    }

    private onPointerDown(event: MouseEvent): void {
        if (this.viewManager.mode === ViewManagerMode.pause) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.button !== 0) {
            return;
        }

        if (this.viewManager.mode !== ViewManagerMode.selecting &&
            this.viewManager.mode !== ViewManagerMode.selected &&
            this.viewManager.mode !== ViewManagerMode.configure) {
            return;
        }

        const elements = Utils.elementsFromPoint(this.ownerDocument, this.pointerX, this.pointerY);

        const element = this.activeHighlightedElement;

        // const element = elements.find(x => x["stylable"]);

        if (!element || !element["stylable"]) {
            return;
        }

        const stylable = element["stylable"];
        const style = stylable.style;

        if (!style) {
            return;
        }

        const selectedElement = this.viewManager.getSelectedElement();

        if (selectedElement && selectedElement.element === element) {
            const select =
                (style.key.startsWith("colors/") && this.selectColor(style)) ||
                (style.key.startsWith("shadows/") && this.selectShadow(style)) ||
                this.selectStyle(style);
        }
        else {
            const contextualEditor = this.getContextualEditor(element, stylable);

            if (!contextualEditor || contextualEditor.selectCommands.length === 0) {
                return;
            }

            const config: IHighlightConfig = {
                element: element,
                text: style["displayName"],
                color: contextualEditor.color
            };

            // contextualEditor.element = element;

            this.viewManager.setSelectedElement(config, contextualEditor);
        }
    }

    private onPointerMove(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.pointerX = event.clientX;
        this.pointerY = event.clientY;

        this.renderHighlightedElements();
    }

    private getContextualEditor(element: HTMLElement, stylable: { style: any; toggleBackground: () => void; }): IContextCommandSet {
        const style = stylable.style;

        const styleContextualEditor: IContextCommandSet = {
            color: "#607d8b",
            deleteCommand: null,
            selectCommands: [],
            element: element
        };

        if ((!style.key.startsWith("globals/") || style.key.startsWith("globals/body/")) &&
            !style.key.startsWith("gradients/") &&
            !style.key.endsWith("/default") && style.key.indexOf("/navbar/default/") === -1
        ) {
            styleContextualEditor.deleteCommand = {
                tooltip: "Delete variation",
                color: "#607d8b",
                component: {
                    name: "confirmation",
                    params: {
                        getMessage: async () => {
                            const references = await this.styleService.checkStyleIsInUse(style.key);
                            const styleNames = references.map(x => x.displayName).join(`", "`);

                            let message = `Are you sure you want to delete this style?`;

                            if (styleNames) {
                                message += ` It is referenced by "${styleNames}".`;
                            }

                            return message;
                        },
                        onConfirm: async () => {
                            this.removeStyle(style);
                            this.viewManager.clearContextualEditors();
                            this.viewManager.notifySuccess("Styles", `Style "${style.displayName}" was deleted.`);
                        },
                        onDecline: () => {
                            this.viewManager.clearContextualEditors();
                        }
                    }
                }
            };
        }

        if (!style.key.startsWith("colors/") &&
            !style.key.startsWith("fonts/") &&
            !style.key.startsWith("shadows/") &&
            !style.key.startsWith("gradients/") &&
            !style.key.contains("/components/") // sub-components
        ) {
            styleContextualEditor.selectCommands.push({
                tooltip: "Change background",
                iconClass: "paperbits-drop",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    stylable.toggleBackground();
                }
            });
        }

        if (style.key.startsWith("colors/") || style.key.startsWith("shadows/")) {
            styleContextualEditor.selectCommands.push({
                tooltip: "Edit variation",
                iconClass: "paperbits-edit-72",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    style.key.startsWith("colors/") ? this.selectColor(style) : this.selectShadow(style);
                }
            });
        }
        else if (!style.key.startsWith("fonts/") && !style.key.startsWith("gradients/")) {
            styleContextualEditor.selectCommands.push({
                tooltip: "Edit variation",
                iconClass: "paperbits-edit-72",
                position: "top right",
                color: "#607d8b",
                callback: () => {
                    const view: IView = {
                        heading: style.displayName,
                        component: {
                            name: "style-editor",
                            params: {
                                elementStyle: style,
                                onUpdate: () => {
                                    this.styleService.updateStyle(style);
                                }
                            }
                        },
                        resize: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            });
        }

        return styleContextualEditor;
    }

    private async rerenderEditors(elements: HTMLElement[]): Promise<void> {
        let highlightedElement: HTMLElement;
        let highlightedText: string;
        let highlightColor: string;

        const tobeDeleted = Object.keys(this.actives);

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const stylable = element["stylable"];

            if (!stylable) {
                continue;
            }

            const style = stylable.style;

            const index = tobeDeleted.indexOf(style.key);
            tobeDeleted.splice(index, 1);

            highlightedElement = element;
            highlightedText = style.displayName;

            const active = this.actives[style.key];
            const contextualEditor = this.getContextualEditor(element, stylable);

            highlightColor = contextualEditor.color;

            if (!active || element !== active.element) {
                this.viewManager.setContextualEditor(style.key, contextualEditor);

                this.actives[style.key] = {
                    element: element
                };
            }
        }

        tobeDeleted.forEach(x => {
            this.viewManager.removeContextualEditor(x);
            delete this.actives[x];
        });

        if (this.activeHighlightedElement !== highlightedElement) {
            this.activeHighlightedElement = highlightedElement;
            this.viewManager.setHighlight({ element: highlightedElement, text: highlightedText, color: highlightColor });
        }
    }
}