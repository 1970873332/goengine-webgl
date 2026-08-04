import DuplicatableComponent from "@goengine/core/src/component/fussy/Duplicatable";

/**
 * 纹理
 */
export default class Texture<
    T extends CanvasImageSource,
    E extends IEvent,
> extends DuplicatableComponent<Func.CallBack<Texture<T, E>>, E> {
    constructor(public source?: T) {
        super();
    }
}

interface IEvent {}

type IAny = Texture<CanvasImageSource, any>;

export { IAny as TextureAny };
