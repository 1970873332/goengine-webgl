import { Euler, Vector3 } from "@core/object/math/Index";
import { BaseNodeSaveJSON } from "@core/object/Node";
import BasePhysicsNode, { BasePhysicsNodeSaveJSON } from "@core/temp/physics/Base";
import { Matter2D } from "@core/temp/physics/Index";
import BaseGeometry, { BaseGeometrySaveJSON } from "@webgl/geometry/Base";
import PlaneGeometry, { PlaneGeometrySaveJSON } from "@webgl/geometry/nodes/planes/Plane";
import BaseMaterial, { BaseMaterialSaveJSON } from "@webgl/material/Base";
import BaseMeshMaterial, { BaseMeshMaterialSaveJSON } from "@webgl/material/Mesh";
import BaseGLNode from "@webgl/node/Base";
import { Collision2D } from "@webgl/node/Index";
import { Collision2DSaveJSON } from "@webgl/node/nodes/Collision2D";
import Mesh, { MeshConfig, MeshSaveJSON } from "@webgl/node/nodes/Mesh";
import { SceneSaveJSON } from "@webgl/node/nodes/Scene";

/**
 * 创建节点
 * @param targetID
 * @param json
 * @returns
 */
export function createNodeByJSON(
    targetID: string,
    json: GLSceneJSON,
): Instance<typeof BaseGLNode> | undefined {
    const { nodes, geometrys, materials, physicss } = json;
    const node = nodes.find((node) => node.uuid === targetID);
    if (!node) return void 0;
    const {
        type,
        visible,
        position,
        anchor,
        scale,
        rotation,
        disableHelper,
        instruct,
        controlled,
        children,
    } = node;
    const meshConfig: MeshConfig = {
        visible,
        instruct,
        disableHelper,
        controlled,
        position: new Vector3(position[0], position[1], position[2]),
        anchor: new Vector3(anchor[0], anchor[1], anchor[2]),
        rotation: new Euler(rotation[0], rotation[1], rotation[2]),
        scale: new Vector3(scale[0], scale[1], scale[2]),
    };

    if (type === "Mesh") {
        const { geometryID, materialID } = node as MeshSaveJSON;
        const mesh = new Mesh(
            createGeometryByJSON(geometryID, geometrys),
            createMaterialByJSON(materialID, materials),
            meshConfig,
        );
        children.forEach((child: string) => {
            const childNode = createNodeByJSON(child, json);
            childNode && mesh.add(childNode);
        });
        return mesh;
    } else if (type === "Collision2D") {
        const { geometryID, materialID, rigidBody } =
            node as Collision2DSaveJSON;
        const collision = new Collision2D(
            void 0,
            void 0,
            void 0,
            meshConfig,
        );
        const physicsBody = createPhysicsByJSON(rigidBody, physicss);
        collision.geometry = createGeometryByJSON(geometryID, geometrys);
        collision.material = createMaterialByJSON(materialID, materials);
        physicsBody instanceof Matter2D &&
            collision.rigidBody.setter(physicsBody);
        collision.setBodyConfig({ position: meshConfig.position?.clone() });
        children.forEach((child: string) => {
            const childNode = createNodeByJSON(child, json);
            childNode && collision.add(childNode);
        });
        return collision;
    }
}

/**
 * 创建几何体
 * @param targetID
 * @param geometrys
 * @returns
 */
export function createGeometryByJSON(
    targetID: string | undefined,
    geometrys: BaseGeometrySaveJSON[],
): Instance<typeof BaseGeometry> | undefined {
    const geometry = geometrys.find(
        (geometry) => geometry.uuid === targetID,
    );
    if (!geometry) return void 0;
    if (geometry.type === "PlaneGeometry") {
        const { size } = geometry as PlaneGeometrySaveJSON;
        return new PlaneGeometry({ width: size[0], height: size[1] });
    }
}

/**
 * 创建材质
 * @param targetID
 * @param materials
 * @returns
 */
export function createMaterialByJSON(
    targetID: string | undefined,
    materials: BaseMaterialSaveJSON[],
): Instance<typeof BaseMaterial> | undefined {
    const material = materials?.find(
        (material) => material.uuid === targetID,
    );
    if (!material) return void 0;
    if (material.type === "BaseMeshMaterial") {
        const { textureAlpha, color, alpha } =
            material as BaseMeshMaterialSaveJSON;
        return new BaseMeshMaterial({ textureAlpha, color, alpha });
    }
}

/**
 * 创建物理
 * @param targetID
 * @param physicss
 * @returns
 */
export function createPhysicsByJSON(
    targetID: string | undefined,
    physicss: BasePhysicsNodeSaveJSON[],
): BasePhysicsNode<any, any, any> | undefined {
    const physics = physicss.find((physics) => physics.uuid === targetID);
    if (!physics) return void 0;
    if (physics.type === "Matter2D") {
        return new Matter2D(physics.config);
    }
}

interface GLSceneJSON {
    /**
     * 节点
     */
    nodes: BaseNodeSaveJSON[];
    /**
     * 几何
     */
    geometrys: BaseGeometrySaveJSON[];
    /**
     * 材质
     */
    materials: BaseMaterialSaveJSON[];
    /**
     * 物理
     */
    physicss: BasePhysicsNodeSaveJSON[];
    /**
     * 场景
     */
    scene: SceneSaveJSON;
}