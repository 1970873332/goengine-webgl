import { BaseNodeSaveJSON } from "@core/object/Node";
import BaseGLNode, { BaseGLNodeConfig } from "../Base";

/**
 * 场景
 */
export default class Scene extends BaseGLNode<IConfig, Record<any, any>> {
    /**
     * 是否是场景
     */
    public readonly isScene: boolean = true;

    constructor(config?: IConfig) {
        super();
        config && this.setConfig(config);
    }
}

interface IConfig extends BaseGLNodeConfig { }

interface ISaveJSON extends BaseNodeSaveJSON { }

export { ISaveJSON as SceneSaveJSON };

