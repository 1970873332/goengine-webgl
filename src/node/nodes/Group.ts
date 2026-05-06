import BaseGLNode, { BaseGLNodeConfig, BaseGLNodeEvent } from "../Base";

/**
 * 组
 */
export default class Group extends BaseGLNode<IConfig, IEvent> {
    /**
     * 是否是组
     */
    public readonly isGroup: boolean = true;

    constructor(config?: IConfig) {
        super();
        config && this.setConfig(config);
    }
}

interface IConfig extends BaseGLNodeConfig { }

interface IEvent extends BaseGLNodeEvent { }
