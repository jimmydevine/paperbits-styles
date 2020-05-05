import * as ko from "knockout";
import template from "./iconPicker.html";
import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import { FontContract, IconContract } from "../../contracts";

@Component({
    selector: "icon-picker",
    template: template
})
export class IconPicker {  

    // @Param()
    // public selectedIcon: ko.Observable<string>;
    //
    // @Event()
    // public readonly onSelect: (icon: IconContract) => void;
    //
    // public readonly icons: ko.ObservableArray<IconContract>;
    //
    // constructor(private readonly font: FontContract) {
    //     this.selectedIcon = ko.observable();
    //     this.icons = ko.observableArray();
    // }  
    //
    // @OnMounted()
    // public async loadIcons(): Promise<void> {
    //     console.log("Icons are loaded");
    // }
    //
    // public selectIcon(icon: IconContract): void {
    //     console.log(icon.iconName + " is selected");
    // }
}
