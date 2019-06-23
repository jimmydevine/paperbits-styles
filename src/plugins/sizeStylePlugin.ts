import { StyleRule } from "@paperbits/common/styles";
import { StylePlugin } from "./stylePlugin";
import { SizeContract } from "../contracts/sizeContract";


export class SizeStylePlugin extends StylePlugin {
    public displayName: string = "Container";

    constructor() {
        super();
    }

    public async contractToStyleRules(contract: SizeContract): Promise<StyleRule[]> {
        const result = [];

        if (contract.minWidth) {
            result.push(new StyleRule("minWidth", this.parseSize(contract.minWidth)));
        }

        if (contract.minHeight) {
            result.push(new StyleRule("minHeight", this.parseSize(contract.minHeight)));
        }

        if (contract.maxWidth) {
            result.push(new StyleRule("maxWidth", this.parseSize(contract.maxWidth)));
        }

        if (contract.maxHeight) {
            result.push(new StyleRule("maxHeight", this.parseSize(contract.maxHeight)));
        }

        return result;
    }
}