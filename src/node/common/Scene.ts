import BaseGLNode, { BaseGLNodeConfig, BaseGLNodeEvent } from "../Base";

/**
 * 场景
 */
export default class Scene extends BaseGLNode<IConfig, IEvent> {
    constructor(config?: IConfig) {
        super();

        config && this.setConfig(config);
    }
}

interface IConfig extends BaseGLNodeConfig {}

interface IEvent extends BaseGLNodeEvent {}
