import { Bag } from "@paperbits/common";
import { ColorContract, ShadowContract, AnimationContract, FontContract, LinearGradientContract } from "./";
import { StyleContract } from "@paperbits/common/styles";

export interface ThemeContract {
    fonts?: Bag<FontContract>;
    colors?: Bag<ColorContract>;
    gradients?: Bag<LinearGradientContract>;
    animations?: Bag<AnimationContract>;
    shadows?: Bag<ShadowContract>;
    globals?: Object;
    components?: Bag<StyleContract>;
    utils?: any;
}