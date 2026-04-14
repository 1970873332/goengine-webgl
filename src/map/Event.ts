import CanvasComponent, {
    CanvasComponentEvent,
} from "@core/component/draw/Canvas";
import { EventState } from "@core/supplement/Event";
import { Vector2 } from "@core/object/math/Index";

/**
 * 事件场景
 */
export default class EventMap<
    E extends IEvent = IEvent,
> extends CanvasComponent<E> {
    /**
     * 是否点击
     */
    public clickDown: boolean = false;
    /**
     * 是否左击
     */
    public leftDown: boolean = false;
    /**
     * 是否中击
     */
    public middleDown: boolean = false;
    /**
     * 是否右击
     */
    public rightDown: boolean = false;
    /**
     * 开始缩放距离
     */
    protected firstZoomDistance: number = 0;
    /**
     * 最后缩放距离
     */
    protected lastZoomDistance: number = 0;

    protected onWheelState: EventState<WindowEventMap> = new EventState(
        this.element,
        "wheel",
        this.handleWheel.bind(this),
    );
    protected onMouseMoveState: EventState<WindowEventMap> = new EventState(
        this.element,
        "mousemove",
        this.handleMouseMove.bind(this),
    );
    protected onMouseUpState: EventState<WindowEventMap> = new EventState(
        window,
        "mouseup",
        this.handleMouseUp.bind(this),
    );
    protected onMouseDownState: EventState<WindowEventMap> = new EventState(
        window,
        "mousedown",
        this.handleMouseDown.bind(this),
    );
    protected onTouchMoveState: EventState<WindowEventMap> = new EventState(
        this.element,
        "touchmove",
        this.handleTouchMove.bind(this),
    );
    protected onTouchStartState: EventState<WindowEventMap> = new EventState(
        window,
        "touchstart",
        this.handleTouchStart.bind(this),
    );
    protected onTouchEndState: EventState<WindowEventMap> = new EventState(
        window,
        "touchend",
        this.handleTouchEnd.bind(this),
    );

    /**
     * 鼠标滚轮事件
     * @param event
     */
    protected handleWheel(event: WheelEvent): void {
        this.dispatchCustomEvent("wheel", event);
        this.dispatchCustomEvent(
            event.deltaY > 0 ? "wheelUp" : "wheelDown",
            event,
        );
    }
    /**
     * 鼠标移动
     * @param event
     */
    protected handleMouseMove(event: MouseEvent): void {
        event.preventDefault();
        this.dispatchCustomEvent("mouseMove", event);
    }
    /**
     * 鼠标按下
     * @param event
     */
    protected handleMouseDown(event: MouseEvent): void {
        this.dispatchCustomEvent("mouseDown", event);
        switch (event.button) {
            case 0:
                this.leftDown = true;
                this.dispatchCustomEvent("leftDown", event);
                break;
            case 1:
                this.middleDown = true;
                this.dispatchCustomEvent("middleDown", event);
                break;
            case 2:
                this.rightDown = true;
                this.dispatchCustomEvent("rightDown", event);
                break;
        }
    }
    /**
     * 鼠标抬起
     * @param event
     */
    protected handleMouseUp(event: MouseEvent): void {
        this.dispatchCustomEvent("mouseUp", event);
        switch (event.button) {
            case 0:
                this.leftDown = false;
                this.dispatchCustomEvent("leftUp", event);
                break;
            case 1:
                this.middleDown = false;
                this.dispatchCustomEvent("middleUp", event);
                break;
            case 2:
                this.rightDown = false;
                this.dispatchCustomEvent("rightUp", event);
                break;
        }
    }
    /**
     * 触摸开始
     * @param event
     */
    protected handleTouchStart(event: TouchEvent): void {
        this.dispatchCustomEvent("touchStart", event);
        if (event.touches.length === 2) {
            const touch1Vector2 = new Vector2(
                event.touches[0].clientX,
                event.touches[0].clientY,
            ),
                touch2Vector2 = new Vector2(
                    event.touches[1].clientX,
                    event.touches[1].clientY,
                );
            this.firstZoomDistance = touch1Vector2.distance(touch2Vector2);
        }
    }
    /**
     * 触摸移动
     * @param event
     */
    protected handleTouchMove(event: TouchEvent): void {
        this.dispatchCustomEvent("touchMove", event);
        if (event.touches.length === 2) {
            const touch1Vector2 = new Vector2(
                event.touches[0].clientX,
                event.touches[0].clientY,
            ),
                touch2Vector2 = new Vector2(
                    event.touches[1].clientX,
                    event.touches[1].clientY,
                );
            this.lastZoomDistance = touch1Vector2.distance(touch2Vector2);
            if (this.lastZoomDistance !== this.firstZoomDistance) {
                this.dispatchCustomEvent("zoom", event);
                if (this.firstZoomDistance < this.lastZoomDistance) {
                    this.dispatchCustomEvent("zoomIn", event);
                } else if (this.firstZoomDistance > this.lastZoomDistance) {
                    this.dispatchCustomEvent("zoomOut", event);
                }
            }
            this.firstZoomDistance = this.lastZoomDistance;
        }
    }
    /**
     * 触摸结束
     * @param event
     */
    protected handleTouchEnd(event: TouchEvent): void {
        this.dispatchCustomEvent("touchEnd", event);
    }

    protected addEvents(): void {
        super.addEvents();
        this.onWheelState.wake();
        this.onMouseMoveState.wake();
        this.onMouseUpState.wake();
        this.onMouseDownState.wake();
        this.onTouchMoveState.wake();
        this.onTouchStartState.wake();
        this.onTouchEndState.wake();
    }

    public destroy(): void {
        super.destroy();
        this.onWheelState.break();
        this.onMouseMoveState.break();
        this.onMouseUpState.break();
        this.onMouseDownState.break();
        this.onTouchMoveState.break();
        this.onTouchStartState.break();
        this.onTouchEndState.break();
    }
}

interface IEvent extends CanvasComponentEvent {
    /**
     * 鼠标移动
     */
    mouseMove: MouseEvent;
    /**
     * 鼠标按下
     */
    mouseDown: MouseEvent;
    /**
     * 鼠标抬起
     */
    mouseUp: MouseEvent;
    /**
     * 左键按下
     */
    leftDown: MouseEvent;
    /**
     * 左键抬起
     */
    leftUp: MouseEvent;
    /**
     * 中键按下
     */
    middleDown: MouseEvent;
    /**
     * 中键抬起
     */
    middleUp: MouseEvent;
    /**
     * 右键按下
     */
    rightDown: MouseEvent;
    /**
     * 右键抬起
     */
    rightUp: MouseEvent;
    /**
     * 鼠标滚轮
     */
    wheel: WheelEvent;
    /**
     * 滚轮向上滚动
     */
    wheelUp: WheelEvent;
    /**
     * 滚轮向下滚动
     */
    wheelDown: WheelEvent;
    /**
     * 触摸开始
     */
    touchStart: TouchEvent;
    /**
     * 触摸移动
     */
    touchMove: TouchEvent;
    /**
     * 触摸结束
     */
    touchEnd: TouchEvent;
    /**
     * 缩放
     */
    zoom: TouchEvent;
    /**
     * 放大
     */
    zoomIn: TouchEvent;
    /**
     * 缩小
     */
    zoomOut: TouchEvent;
}

export { IEvent as EventMapEvent };

