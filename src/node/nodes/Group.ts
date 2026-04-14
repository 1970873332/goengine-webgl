import BaseGLNode, { BaseGLNodeConfig } from "../Base";

/**
 * 组
 */
export default class Group extends BaseGLNode<IConfig, Record<any, any>> {
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
