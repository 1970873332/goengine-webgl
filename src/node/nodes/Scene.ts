import { BaseNodeSaveJSON } from "@core/object/Node";
import BaseGLNode, { BaseGLNodeConfig, BaseGLNodeEvent } from "../Base";

/**
 * 场景
 */
export default class Scene extends BaseGLNode<IConfig, IEvent> {
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

interface IEvent extends BaseGLNodeEvent { }

interface ISaveJSON extends BaseNodeSaveJSON { }

export { ISaveJSON as SceneSaveJSON };

