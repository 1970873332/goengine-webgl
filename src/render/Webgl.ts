import Matrix4 from "@goengine/core/src/object/math/matrix/Matrix4";
import Vector3 from "@goengine/core/src/object/math/vector/Vector3";
import { ArrayUtils } from "@goengine/core/src/util/Array";
import {
    Blend,
    CullFace,
    UniformKey,
    UniformType,
} from "@goengine/webgl/src/GLSL";
import Mesh, { MeshAny } from "@goengine/webgl/src/node/common/Mesh";
import Scene from "@goengine/webgl/src/node/common/Scene";
import Texture from "@goengine/webgl/src/state/Texture";
import BufferCache from "../cache/Buffer";
import ProgramCache from "../cache/Program";
import ShaderCache from "../cache/Shader";
import StateCache, { State } from "../cache/State";
import TextureCache from "../cache/Texture";
import { CameraAny } from "../camera/Camera";
import { BaseMaterialAny } from "../material/Base";
import ShaderMaterial, { ShaderMaterialUniform } from "../material/node/Shader";

/**
 * Webgl渲染器
 */
export default class WebglRenderer {
    constructor(config: IConfig) {
        const { gl = this.gl } = config;

        Object.assign(this, {
            gl,
            stateCache: new StateCache(gl),
            shaderCache: new ShaderCache(gl),
            bufferCache: new BufferCache(gl),
            textureCache: new TextureCache(gl),
            programCache: new ProgramCache(gl),
        });
    }

    /**
     * 当前使用的程序
     */
    declare protected currentProgram: WebGLProgram;
    /**
     * webgl上下文
     */
    declare protected gl: Canvas.WebGLContext;
    /**
     * 缓冲缓存
     */
    declare protected bufferCache: BufferCache;
    /**
     * 着色器缓存
     */
    declare protected shaderCache: ShaderCache;
    /**
     * 纹理缓存
     */
    declare protected textureCache: TextureCache;
    /**
     * 程序缓存
     */
    declare protected programCache: ProgramCache;
    /**
     * 状态缓存
     */
    declare protected stateCache: StateCache;
    /**
     * 临时float32数组
     */
    protected readonly interimFloat32Array = new Float32Array(
        Matrix4.identity.length,
    );
    /**
     * 当前已应用的 GL 渲染状态（渲染器级缓存，避免每个节点重复调用 GL）
     */
    protected renderState: RenderState = {
        blend: false,
        blending: Blend.None,
        depthTest: false,
        depthWrite: true,
        cull: false,
        cullFace: CullFace.None,
    };

    /**
     * 应用MVP矩阵
     * @param key
     * @param matrix
     * @param program
     * @param state
     */
    protected applyMVPMatrix(
        key: string,
        matrix: Matrix4,
        program: WebGLProgram,
        state: State,
    ): void {
        const {
            uniform: {
                location
            }
        } = state;

        let u_matrix: WebGLUniformLocation | undefined = location[key];

        if (!u_matrix) {
            u_matrix = this.gl.getUniformLocation(program, key) ?? void 0;

            if (!u_matrix) {
                console.warn(`uniform变量${key}未找到`);
                return;
            }

            location[key] = u_matrix;
        }

        // 4. 更新矩阵数据
        this.interimFloat32Array.set(matrix.m);
        this.gl.uniformMatrix4fv(u_matrix, false, this.interimFloat32Array);
    }
    /**
     * 应用渲染模式
     * @param material
     */
    protected applyRenderMode(material: BaseMaterialAny): void {
        const { transparent, depthTest, depthWrite, cull, blending } = material,
            { renderState, gl } = this;

        // 混合：透明材质启用混合，不透明禁用
        if (renderState.blend !== transparent) {
            renderState.blend = transparent;
            transparent ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
        }

        // 混合函数：仅在透明且模式变化时更新
        if (transparent && renderState.blending !== blending) {
            renderState.blending = blending;
            switch (blending) {
                case Blend.None:
                    gl.blendFunc(gl.ONE, gl.ZERO);
                    break;
                case Blend.Normal:
                default:
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    break;
            }
            gl.blendEquation(gl.FUNC_ADD);
        }

        // 深度测试
        if (renderState.depthTest !== depthTest) {
            renderState.depthTest = depthTest;
            depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
        }

        // 深度写入：透明物体不写入深度（深度测试仍生效，不透明物体正常遮挡）。
        // 否则双面渲染时远面先绘制会与后绘制的近面在同一像素上重复混合，
        // 产生随视角变化的明暗斑块（看起来像部分面有阴影）
        const writeDepth: boolean = depthWrite && !transparent;
        if (renderState.depthWrite !== writeDepth) {
            renderState.depthWrite = writeDepth;
            gl.depthMask(writeDepth);
        }

        // 剔除：None 关闭剔除，Front / Back 分别剔除对应面
        const culling: boolean = cull !== CullFace.None;
        if (renderState.cull !== culling) {
            renderState.cull = culling;
            culling ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE);
        }
        if (culling && renderState.cullFace !== cull) {
            renderState.cullFace = cull;
            gl.cullFace(cull === CullFace.Front ? gl.FRONT : gl.BACK);
        }
    }

    /**
     * 设置uniform变量值
     * @param uniforms
     * @param program
     * @param state
     */
    protected setupUniform(
        uniforms: ShaderMaterialUniform,
        program: WebGLProgram,
        state: State,
    ): void {
        const {
            texture: { list },
            uniform: { location },
        } = state;

        Object.entries(uniforms).forEach(([name, attribute]) => {
            const uniform_location: WebGLUniformLocation | null =
                location[name] ??
                this.gl.getUniformLocation(program, name);

            if (!uniform_location) return console.warn(`uniform变量${name}未找到`);

            // 设置uniform变量值
            switch (attribute.type) {
                case UniformType.Texture:
                    if (attribute.value instanceof Texture) {
                        const texture: WebGLTexture = this.textureCache.allocate(
                            attribute.value,
                            this.stateCache.nextUnit,
                        );

                        let unit: number = list.indexOf(texture);

                        if (this.stateCache.unit !== unit) {
                            if (unit === -1) {
                                list[
                                    (unit = this.stateCache.stepUnit())
                                ] = texture;
                            }

                            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
                            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                        }

                        this.gl.uniform1i(location, unit);
                    }
                    break;
            }

            // 更新uniform变量位置
            if (!(name in location)) {
                location[name] = uniform_location;
            }
        });
    }

    /**
     * 渲染节点
     * @param node
     * @param camera
     * @returns
     */
    public renderNode(node: MeshAny, camera: CameraAny): void {
        const { material, geometry } = node;
        if (!material || !geometry) return;
        const // 分配着色器
            shader = this.shaderCache.allocate(material),
            // 分配程序
            program = this.programCache.allocate(shader);
        if (!program) return console.warn("程序未准备就绪", node);
        // 分配状态
        const state = this.stateCache.allocate(program);

        if (program !== this.currentProgram) {
            this.currentProgram = program;

            this.gl.useProgram(program);
        }
        // 应用渲染模式（每个节点都应用，材质不同的网格共享同一 program 时也正确切换）
        this.applyRenderMode(material);

        // 应用MVP矩阵
        this.applyMVPMatrix(
            UniformKey.modelMatrix,
            node.worldMatrix,
            program,
            state,
        );
        this.applyMVPMatrix(
            UniformKey.viewMatrix,
            camera.worldMatrix,
            program,
            state,
        );
        this.applyMVPMatrix(
            UniformKey.projectionMatrix,
            camera.projectionMatrix,
            program,
            state,
        );

        // 绑定缓冲
        this.bufferCache.bind(geometry, program, state);

        // 更新uniform变量
        if (material instanceof ShaderMaterial) {
            this.setupUniform(material.uniforms, program, state);
        }

        // 绘制
        if (geometry.index) {
            this.gl.drawElements(
                this.gl.TRIANGLES,
                geometry.index.length,
                this.gl.UNSIGNED_SHORT,
                0,
            );
        } else {
            const {
                attribute: { position },
            } = geometry,
                { size, length } = position ?? { size: 0, length: 0 };
            this.gl.drawArrays(this.gl.TRIANGLES, 0, length / size);
        }
    }
    /**
     * 渲染场景
     * @param scene
     * @param camera
     */
    public renderScene(scene: Scene, camera: CameraAny): void {
        // 透明物体收集列表（带相机视图空间深度，画家排序后统一绘制）
        const transparent: Array<{ node: MeshAny; depth: number }> = [];
        // 临时向量：计算透明物体在相机视图空间的深度
        const view = new Vector3();

        ArrayUtils.traverse(
            scene.children,
            (node) => {
                // 注意：回调必须返回 void 而非 false，
                // 否则 ArrayUtils.traverse 会把 false 视为"跳过子树"，
                // 导致 Group 等节点内的网格永远无法渲染。
                if (node instanceof Mesh) {
                    // 先渲染不透明物体（保持场景树顺序）
                    if (node.material?.transparent) {
                        // 视图矩阵把世界坐标变换到相机空间，相机朝 -Z 方向看，
                        // viewZ 越小（负得越多）离相机越远，作为画家排序依据
                        const depth = view
                            .copy(node.worldPosition)
                            .applyMatrix4(camera.worldMatrix).z;
                        transparent.push({ node, depth });
                    }
                    else this.renderNode(node, camera);
                }
            },
        );

        // 画家排序：透明物体按相机视角深度由远到近绘制（viewZ 升序），
        // 否则透明物体会被后绘制的近处不透明物体遮挡，特定角度下失去透明度
        transparent
            .sort((a, b) => a.depth - b.depth)
            .forEach(({ node }) => this.renderNode(node, camera));
    }
    /**
     * 销毁
     */
    public destroy(): void { }
}

/**
 * 渲染器级 GL 状态缓存：记录已应用到上下文的状态，避免重复调用 GL
 */
interface RenderState {
    /**
     * 是否启用混合
     */
    blend: boolean;
    /**
     * 当前混合模式
     */
    blending: Blend;
    /**
     * 是否启用深度测试
     */
    depthTest: boolean;
    /**
     * 是否写入深度
     */
    depthWrite: boolean;
    /**
     * 是否启用面剔除
     */
    cull: boolean;
    /**
     * 当前剔除面
     */
    cullFace: CullFace;
}

interface IConfig {
    /**
     * webgl上下文
     */
    gl: Canvas.WebGLContext;
    /**
     * 是否开启深度测试
     */
    depthTest?: boolean;
}
