
/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import "./ko/bindingHandlers/bindingHandlers.styled";
import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { StyleService, DefaultStyleCompiler } from "./";
import { StylePublisher } from "./publishing/stylePublisher";
import { StyleManager } from "./styleManager";


export class StyleModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindSingleton("styleService", StyleService);
        injector.bindToCollection("publishers", StylePublisher);
        injector.bindSingleton("styleCompiler", DefaultStyleCompiler);
        injector.bindSingleton("styleManager", StyleManager);
    }
}