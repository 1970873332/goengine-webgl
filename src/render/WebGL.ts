import { ArrayUtils } from "@goengine/core/src/util/Array";
import Matrix4 from "@goengine/core/src/object/math/matrix/Matrix4";
import Vector3 from "@goengine/core/src/object/math/vector/Vector3";
import Mesh, { MeshAny } from "@goengine/webgl/src/node/common/Mesh";
import BufferCache from "../cache/Buffer";
import ProgramCache from "../cache/Program";
import CacheShader from "../cache/Shader";
import TextureCache from "../cache/Texture";
import { CameraAny } from "../camera/Camera";
import { BaseGeometryAny } from "../geometry/Base";
import { Blend, CullFace, UniformKey, UniformType } from "../GLSL";
import { BaseMaterialAny } from "../material/Base";
import ShaderMaterial, { ShaderMaterialUniform } from "../material/node/Shader";
import Scene from "../node/common/Scene";
import ProgramState from "../state/Program";
import RenderState from "../state/Render";
import Texture from "../state/Texture";

const {
    TRIANGLES,
    UNSIGNED_SHORT
} = WebGLRenderingContext;

/**
 * Webgl渲染器
 */
export default class WebglRenderer {
    constructor(config: IConfig) {
        const { gl = this.gl } = config;

        Object.assign(this, {
            gl,
            renderState: new RenderState(gl),
            shaderCache: new CacheShader(gl),
            programCache: new ProgramCache(gl),
            bufferCache: new BufferCache(gl),
            textureCache: new TextureCache(gl)
        });
    }

    /**
     * webgl上下文
     */
    declare protected gl: Canvas.WebGLContext;
    /**
     * 当前使用的程序
     */
    declare protected currentProgram: WebGLProgram;
    /**
     * 渲染状态
     */
    declare protected renderState: RenderState;
    /**
     * 着色器缓存
     */
    declare public readonly shaderCache: CacheShader;
    /**
     * 程序缓存
     */
    declare public readonly programCache: ProgramCache;
    /**
     * 缓冲缓存
     */
    declare public readonly bufferCache: BufferCache;
    /**
     * 纹理缓存
     */
    declare public readonly textureCache: TextureCache;

    /**
    * 临时三维向量
    */
    protected readonly interimVector3 = new Vector3();
    /**
     * 临时float32数组
     */
    protected readonly interimFloat32Array = new Float32Array(
        Matrix4.identity.length,
    );

    /**
     * 绘制几何体
     * @param geometry 
     */
    protected draw(geometry: BaseGeometryAny): void {
        const
            {
                gl
            } = this,
            {
                index,
                attribute: {
                    position
                }
            } = geometry;

        // 绘制索引几何体
        if (index) {
            gl.drawElements(
                TRIANGLES,
                index.length,
                UNSIGNED_SHORT,
                0,
            );
        }
        // 绘制非索引几何体
        else {
            const { length = 0, size = 0 } = position ?? {};

            gl.drawArrays(TRIANGLES, 0, length / size);
        }
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

        // 深度写入：透明物体不写入深度
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
     * 应用MVP矩阵
     * @param key 
     * @param matrix 
     * @param program 
     * @returns 
     */
    protected applyMVPMatrix(
        program: WebGLProgram,
        key: string,
        matrix: Matrix4,
    ): void {
        /* 这里需要调整未采用location缓存获取 */
        const matrix_location: WebGLUniformLocation | null = this.gl.getUniformLocation(program, key);

        if (!matrix_location) {
            console.warn(`uniform变量${key}未找到`);
            return;
        }

        // 临时赋值
        this.interimFloat32Array.set(matrix.m);
        // 上传四维矩阵数据
        this.gl.uniformMatrix4fv(matrix_location, false, this.interimFloat32Array);
    }
    /**
     * 设置uniform变量值
     * @param uniforms
     * @param program
     * @param state
     */
    protected setupUniform(
        program: WebGLProgram,
        uniforms: ShaderMaterialUniform,
    ): void {
        Object.entries(uniforms).forEach(([name, attribute]) => {
            const uniform_location: WebGLUniformLocation | null = this.gl.getUniformLocation(program, name);

            if (!uniform_location) return console.warn(`uniform变量${name}未找到`);

            // 设置uniform变量值
            switch (attribute.type) {
                case UniformType.Texture:
                    if (attribute.value instanceof Texture) {
                        const texture: WebGLTexture = this.textureCache.allocate(
                            attribute.value,
                            this.textureCache.nextUnit,
                        );

                        let unit: number = this.textureCache.list.indexOf(texture);

                        if (this.textureCache.unit !== unit) {
                            if (unit === -1) {
                                this.textureCache.list[
                                    (unit = this.textureCache.stepUnit())
                                ] = texture;
                            }

                            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
                            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                        }

                        this.gl.uniform1i(location, unit);
                    }
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
    public renderNode(node: MeshAny, camera: CameraAny): void {
        const { material, geometry } = node;

        if (!material || !geometry) return;

        const
            [
                vertexShaderState,
                fragmentShaderState
            ] = this.shaderCache.allocate(material),
            programState = this.programCache.save(ProgramState.obtainUUID(vertexShaderState.uuid, fragmentShaderState.uuid));

        // 编译顶点着色器
        !vertexShaderState.compiled && vertexShaderState.complete(this.gl);
        // 编译片元着色器
        !fragmentShaderState.compiled && fragmentShaderState.complete(this.gl);
        // 链接程序
        !programState.ready && programState.link(this.gl, vertexShaderState, fragmentShaderState);

        const { program } = programState;
        // 切换程序
        if (program) {
            if (program !== this.currentProgram) {
                this.currentProgram = program;

                this.gl.useProgram(program);
            }
        }
        else return console.log("程序未就绪");

        // 应用渲染模式
        this.applyRenderMode(material);

        // 绑定缓冲
        this.bufferCache.bind(program, geometry);

        // 应用MVP矩阵（这里需要调整为通用uniform更新）
        this.applyMVPMatrix(
            program,
            UniformKey.modelMatrix,
            node.worldMatrix,
        );
        this.applyMVPMatrix(
            program,
            UniformKey.viewMatrix,
            camera.worldMatrix,
        );
        this.applyMVPMatrix(
            program,
            UniformKey.projectionMatrix,
            camera.projectionMatrix,
        );
        // 更新uniform变量
        if (material instanceof ShaderMaterial) {
            this.setupUniform(program, material.uniforms);
        }

        // 绘制
        this.draw(geometry);
    }
    /**
     * 渲染
     * @param scene 
     * @param camera 
     */
    public render(scene: Scene, camera: CameraAny): void {
        // 透明物体收集列表（带相机视图空间深度，画家排序后统一绘制）
        const transparent: Array<{ node: MeshAny; depth: number }> = [];

        ArrayUtils.traverse(
            scene.children,
            (node) => {
                if (node instanceof Mesh) {
                    // 先渲染不透明物体（保持场景树顺序）
                    if (node.material?.transparent) {
                        const depth = this.interimVector3
                            .copy(node.worldPosition)
                            .applyMatrix4(camera.worldMatrix).z;
                        transparent.push({ node, depth });
                    }
                    else this.renderNode(node, camera);
                }
            }
        );

        transparent
            .sort((a, b) => a.depth - b.depth)
            .forEach(({ node }) => this.renderNode(node, camera));
    }

    /**
     * 销毁
     */
    public destroy(): void { }
}

interface IConfig {
    /**
     * webgl上下文
     */
    gl: Canvas.WebGLContext;
}
