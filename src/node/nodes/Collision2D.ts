import Value from "@core/object/attribute/Value";
import { Euler, Vector3 } from "@core/object/math/Index";
import { Vector3Type } from "@core/object/math/vector/Vector3";
import { Matter2D } from "@core/temp/physics/Index";
import BaseGeometry from "@webgl/geometry/Base";
import BaseMaterial from "@webgl/material/Base";
import { Body, IBodyDefinition } from "matter-js";
import Mesh, { MeshConfig, MeshSaveJSON } from "./Mesh";

/**
 * 2D碰撞
 */
export default class Collision2D<
    G extends BaseGeometry<any, any>,
    M extends BaseMaterial<any, any>,
    B extends Matter2D<any, any>,
    C extends IConfig,
    E extends {}
> extends Mesh<G, M, C, E> {
    /**
     * 是否是碰撞2D
     */
    public readonly isCollision2D: boolean = true;

    /**
     * 物理
     */
    protected physics_source?: IPhysics;

    constructor(geometry?: G, material?: M, body?: B, config?: C) {
        super(geometry, material, config);
        this.rigidBody.setter(body);
        this.setBodyConfig({
            position: config?.position?.clone(),
        });
        console.error("这里刚体配置需要完善");
    }

    /**
     * 是否跟随物理世界
     */
    public autoFollowBody: boolean = true;
    /**
     * 刚体
     */
    public rigidBody = new Value<
        B | undefined
    >(void 0).bindCallback((prev, next) => {
        prev && this.removeToPhysics();
        next && this.appendToPhysics();
    });

    /**
     * 物理
     */
    public get physics(): IPhysics | undefined {
        return this.physics_source;
    }
    protected set physics(v: IPhysics | undefined) {
        this.physics_source = v;
    }

    /**
     * 绑定物理世界
     * @param physics
     * @returns
     */
    public bindPhysics(physics: IPhysics): this {
        this.physics = physics;
        this.appendToPhysics();
        return this;
    }
    /**
     * 解绑物理世界
     */
    public unbindPhysics(): this {
        this.removeToPhysics();
        delete this.physics;
        return this;
    }
    /**
     * 添加到物理世界
     */
    public appendToPhysics(): void {
        this.physics &&
            this.rigidBody.value &&
            this.physics.add(this.rigidBody.value.body);
    }
    /**
     * 从物理世界移除
     */
    public removeToPhysics(): void {
        this.physics &&
            this.rigidBody.value &&
            this.physics.remove(this.rigidBody.value.body);
    }
    /**
     * 跟随物理世界
     * @returns
     */
    public followBody(): void {
        if (!this.rigidBody.value) return;
        this.position.copy(
            new Vector3(
                this.rigidBody.value.body.position.x,
                -this.rigidBody.value.body.position.y,
            ),
        );
        this.rotation.copy(new Euler(0, 0, -this.rigidBody.value.body.angle));
    }
    /**
     * 设置刚体配置
     * @param config
     * @returns
     */
    public setBodyConfig(
        config: Pick<IBodyDefinition, "position" | "angle">,
    ): this {
        if (this.rigidBody.value) {
            const body: Body = this.rigidBody.value.body;
            config.position && Body.setPosition(body, config.position);
            config.angle && Body.setAngle(body, config.angle);
            this.autoFollowBody && this.followBody();
        }
        return this;
    }

    public unbindParent(): this {
        super.unbindParent();
        this.unbindPhysics();
        return this;
    }

    public toJSON(): ISaveJSON {
        const { position, ...Rest } = super.toJSON();

        return {
            ...Rest,
            position: position.map((item: number, index: number) => {
                const resultItem: number = index === 1 ? -item : item;
                return this.rigidBody.value?.body.isStatic
                    ? resultItem
                    : Math.trunc(resultItem);
            }) as Vector3Type,
            rigidBody: this.rigidBody.value?.uuid,
        };
    }
}

interface IConfig extends MeshConfig {
    /**
     * 是否自动跟随刚体
     */
    autoFollowBody?: boolean;
}

interface ISaveJSON extends MeshSaveJSON {
    /**
     * 刚体
     */
    rigidBody?: string;
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

export {
    IConfig as Collision2DConfig,
    ISaveJSON as Collision2DSaveJSON,
    IPhysics as Physics
};

