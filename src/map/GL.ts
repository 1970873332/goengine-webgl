import CanvasComponent from "@core/component/draw/Canvas";
import Camera from "../camera/Camera";
import { Scene } from "../node/Index";
import WebglRenderer from "../render/Webgl";
import { EventMapEvent } from "./Event";

/**
 * Webgl场景
 */
export default abstract class GLMap<
    E extends IEvent = IEvent,
> extends CanvasComponent<E> {
    /**
     * 相机
     */
    declare public camera: Camera<any, any>;
    /**
     * 渲染器
     */
    declare public webglRenderer: WebglRenderer;

    /**
     * 场景
     */
    public scene: Scene = new Scene();
}

interface IEvent extends EventMapEvent { }
