import IdentityComponent from "@core/component/Identity";

export default class Texture<T extends CanvasImageSource, E extends IEvent> extends IdentityComponent<E> {

    constructor(public target?: T) {
        super();
    }

}

interface IEvent { }