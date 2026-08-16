import { Matter2D } from "@goengine/core/experimental/object/physics/Index";
import Value from "@goengine/core/src/object/attribute/Value";
import Euler from "@goengine/core/src/object/math/transfrom/Euler";
import Vector3 from "@goengine/core/src/object/math/vector/Vector3";
import { BaseGeometryAny } from "@goengine/webgl/src/geometry/Base";
import { BaseMaterialAny } from "@goengine/webgl/src/material/Base";
import { Body, IBodyDefinition } from "matter-js";
import Mesh, { MeshConfig } from "../src/node/common/Mesh";

/**
 * 2D碰撞
 */
export default class Collision2D<
    G extends BaseGeometryAny,
    M extends BaseMaterialAny,
    B extends Matter2D,
    C extends IConfig,
    E extends {},
> extends Mesh<G, M, C, E> {
    constructor(geometry?: G, material?: M, body?: B, config?: C) {
        super(geometry, material, config);

        this.body.setter(body);
        config?.position &&
            this.setBodyConfig({
                position: Vector3.fromObject(config.position),
            });
        console.error("这里刚体配置需要完善");
    }

    /**
     * 是否跟随物理世界
     */
    public autofollow: boolean = true;
    /**
     * 刚体
     */
    public body = new Value<B | undefined>(void 0).bindCallback(
        (prev, next) => {
            prev && this.removeToPhysics();
            next && this.appendToPhysics();
        },
    );
    /**
     * 物理
     */
    public readonly physics = new Value<IPhysics | undefined>(void 0);

    /**
     * 绑定物理世界
     * @param physics
     * @returns
     */
    public bindPhysics(physics: IPhysics): this {
        this.physics.value = physics;
        this.appendToPhysics();
        return this;
    }
    /**
     * 解绑物理世界
     */
    public unbindPhysics(): this {
        this.removeToPhysics();
        this.physics.value = void 0;
        return this;
    }
    /**
     * 添加到物理世界
     */
    public appendToPhysics(): void {
        this.physics.value &&
            this.body.value &&
            this.physics.value.add(this.body.value.body);
    }
    /**
     * 从物理世界移除
     */
    public removeToPhysics(): void {
        this.physics.value &&
            this.body.value &&
            this.physics.value.remove(this.body.value.body);
    }
    /**
     * 跟随物理世界
     * @returns
     */
    public followBody(): void {
        const { value: bodyValue } = this.body;

        if (!bodyValue?.body.value) return;

        const {
            body: { value },
        } = bodyValue;

        this.position.copy(new Vector3(value.position.x, -value.position.y));
        this.rotation.copy(new Euler(0, 0, -value.angle));
    }
    /**
     * 设置刚体配置
     * @param config
     * @returns
     */
    public setBodyConfig(
        config: Pick<IBodyDefinition, "position" | "angle">,
    ): this {
        const { value } = this.body;
        if (value?.body.value) {
            const body: Body = value.body.value;
            config.position && Body.setPosition(body, config.position);
            config.angle && Body.setAngle(body, config.angle);
            this.autofollow && this.followBody();
        }
        return this;
    }

    public setConfig(config: C): void {
        super.setConfig(config);

        const { autofollow = this.autofollow } = config;

        Object.assign(this, {
            autofollow,
        });
    }

    public unbindParent(): this {
        super.unbindParent();

        this.unbindPhysics();
        return this;
    }
}

interface IConfig extends MeshConfig {
    /**
     * 是否自动跟随刚体
     */
    autofollow?: boolean;
}

interface IPhysics {
    /**
     * 添加
     * @param args
     * @returns
     */
    add: (...args: unknown[]) => void;
    /**
     * 移除
     * @param args
     * @returns
     */
    remove: (...args: unknown[]) => void;
    /**
     * 销毁
     * @returns
     */
    destroy: () => void;
}

type IAny = Collision2D<BaseGeometryAny, BaseMaterialAny, Matter2D, any, any>;

export {
    IAny as Collision2DAny,
    IConfig as Collision2DConfig,
    IPhysics as Physics,
};
