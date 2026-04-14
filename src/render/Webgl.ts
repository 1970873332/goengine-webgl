import { Matrix4 } from "@core/object/math/Index";
import { BlendType, SideType, UniformKey, UniformType } from "@webgl/GLSL";
import { Texture } from "three";
import BufferCache from "../cache/Buffer";
import ProgramCache from "../cache/Program";
import ShaderCache from "../cache/Shader";
import StateCache, { State } from "../cache/State";
import TextureCache from "../cache/Texture";
import Camera from "../camera/Camera";
import BaseGeometry from "../geometry/Base";
import BaseMaterial from "../material/Base";
import ShaderMaterial, { ShaderMaterialUniform } from "../material/Shader";
import { Mesh } from "../node/Index";
import ShaderState from "../states/Shader";

/**
 * Webgl渲染器
 */
export default class WebglRenderer {
    /**
     * webgl上下文
     */
    protected declare gl: GLSL.WebGLAllRenderingContext;
    /**
     * 缓冲缓存
     */
    protected declare bufferCache: BufferCache;
    /**
     * 着色器缓存
     */
    protected declare shaderCache: ShaderCache;
    /**
     * 纹理缓存
     */
    protected declare textureCache: TextureCache;
    /**
     * 程序缓存
     */
    protected declare programCache: ProgramCache;
    /**
     * 状态缓存
     */
    protected declare stateCache: StateCache;

    constructor(config: IConfig) {
        this.gl = config.gl;
        this.bufferCache = new BufferCache(this.gl);
        this.shaderCache = new ShaderCache(this.gl);
        this.textureCache = new TextureCache(this.gl);
        this.programCache = new ProgramCache(this.gl);
        this.stateCache = new StateCache(this.gl);
    }

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
        const u_matrix: WebGLUniformLocation | null =
            state.uniform.location[key] ??
            this.gl.getUniformLocation(program, key);
        this.gl.uniformMatrix4fv(
            u_matrix,
            false,
            new Float32Array(matrix.toArray()),
        );
    }
    /**
     * 应用渲染模式
     * @param state
     * @param material
     */
    protected applyRenderMode(state: State, material: BaseMaterial<any, any>): void {
        const { transparent, depthTest, depthWrite, side, blending } = material;

        // 混合
        if (state.use.blend !== transparent) {
            state.expire = true;
            this.gl[(state.use.blend = transparent) ? "enable" : "disable"](
                this.gl.BLEND,
            );
            if (transparent && state.apply.blending !== blending) {
                switch ((state.apply.blending = blending)) {
                    case BlendType.None:
                        this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);
                        this.gl.blendEquation(this.gl.FUNC_ADD);
                        break;
                    case BlendType.Normal:
                        this.gl.blendFunc(
                            this.gl.SRC_ALPHA,
                            this.gl.ONE_MINUS_SRC_ALPHA,
                        );
                        this.gl.blendEquation(this.gl.FUNC_ADD);
                        break;
                }
            }
        }
        // 深度测试
        if (state.use.depthTest !== depthTest) {
            state.expire = true;
            this.gl[(state.use.depthTest = depthTest) ? "enable" : "disable"](
                this.gl.DEPTH_TEST,
            );
        }
        // // 深度写入 - 这里需要考虑透明性，做额外处理
        // if (state.use.depthWrite !== depthWrite) {
        //     state.expire = true;
        //     this.gl.depthMask(state.use.depthWrite = depthWrite);
        //     console.log("切换深度写入:", state.use.depthWrite);
        // }
        // 深度写入 根据透明性处理
        if (state.use.depthWrite === transparent) {
            state.expire = true;
            this.gl.depthMask((state.use.depthWrite = !transparent));
        }
        // 剔除
        if (side === SideType.Double) {
            if (state.use.cull) {
                state.expire = true;
                state.use.cull = false;
                this.gl.disable(this.gl.CULL_FACE);
            }
        } else {
            if (!state.use.cull) {
                state.expire = true;
                state.use.cull = true;
                this.gl.enable(this.gl.CULL_FACE);
            }
            if (state.apply.cull === side) {
                state.expire = true;
                if (side === SideType.Back) {
                    state.apply.cull = SideType.Front;
                    this.gl.cullFace(this.gl.FRONT);
                } else if (side === SideType.Front) {
                    state.apply.cull = SideType.Back;
                    this.gl.cullFace(this.gl.BACK);
                }
            }
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
        Object.entries(uniforms).forEach(([name, attribute]) => {
            const location: WebGLUniformLocation | null =
                state.uniform.location[name] ??
                this.gl.getUniformLocation(program, name),
                { value, type } = attribute;
            if (!location || !value) return;
            // 更新uniform变量位置
            if (!(name in state.uniform.location)) {
                state.expire = true;
                state.uniform.location[name] = location;
            }
            // 设置uniform变量值
            switch (type) {
                case UniformType.Texture:
                    const texture: WebGLTexture = this.textureCache.allocate(
                        value as Texture,
                        this.stateCache.nextUnit,
                    );
                    let unit: number = state.texture.list.indexOf(texture);
                    if (this.stateCache.currentUnit !== unit) {
                        if (unit === -1) {
                            state.expire = true;
                            state.texture.list[
                                (unit = this.stateCache.stepUnit())
                            ] = texture;
                        } else {
                            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
                            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                        }
                    }
                    this.gl.uniform1i(location, unit);
                    break;
            }
        });
    }

    /**
     * 渲染节点
     * @param node
     * @param camera
     * @returns
     */
    public renderNode(node: Mesh<any, any, any, any>, camera: Camera<any, any>): void {
        const {
            material: { value: material },
            geometry: { value: geometry },
        } = node as Mesh<BaseGeometry<any, any>, BaseMaterial<any, any>, any, any>;
        if (!material || !geometry) return;
        const // 分配着色器
            shader: GLSL.Shader<ShaderState<any>> =
                this.shaderCache.allocate(material),
            // 分配程序
            program: WebGLProgram | undefined =
                this.programCache.allocate(shader);
        if (!program) return console.warn("程序未准备就绪", node);
        // 分配状态
        const state: State = this.stateCache.allocate(program);

        // 使用程序
        this.stateCache.useProgram(program);

        // 绑定缓冲
        this.bufferCache.bind(geometry, program, state);

        // 应用渲染模式
        this.applyRenderMode(state, material);

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

        // 更新uniform变量
        if (material instanceof ShaderMaterial) {
            this.setupUniform(material.uniforms, program, state);
        }

        // 更新状态缓存
        if (state.expire) {
            state.expire = false;
            this.stateCache.set(program, state);
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
}

interface IConfig {
    /**
     * 渲染上下文
     */
    gl: GLSL.WebGLAllRenderingContext;
    /**
     * 是否开启深度测试
     */
    depthTest?: boolean;
}
