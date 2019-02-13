import * as Objects from "@paperbits/common";
import { StylePlugin } from "./stylePlugin";
import { ThemeContract, ShadowContract } from "../contracts";

export class ShadowStylePlugin extends StylePlugin {
    public readonly name = "shadow";

    constructor(private readonly themeContract: ThemeContract) {
        super();
    }

    public async contractToJss(shadow: any): Promise<Object> {
        if (!shadow || !shadow.shadowKey) {
            return {};
        }

        const shadowContract = Objects.getObjectAt<ShadowContract>(shadow.shadowKey, this.themeContract);

        if (shadowContract) {
            const result = {
                boxShadow: {
                    x: shadowContract.offsetX || 0,
                    y: shadowContract.offsetY || 0,
                    blur: shadowContract.blur || 0,
                    spread: shadowContract.spread || 0,
                    color: shadowContract.color || "#000",
                    inset: shadowContract.inset ? "inset" : undefined
                }
            };

            return result;
        }
        else {
            console.warn(`Shadow with key "${shadow.shadowKey}" not found. Elements using it will fallback to parent's definition.`);
            return {};
        }
    }
}