import ShaderState from "../states/Shader";
import WeakMapCache from "./base/WeakMap";

/**
 * 程序缓存
 */
export default class ProgramCache extends WeakMapCache<GLSL.Shader<ShaderState<any>>, WebGLProgram> {
    /**
     * 分配
     * @param shader
     * @returns
     */
    public allocate(
        shader: GLSL.Shader<ShaderState<any>>,
    ): WebGLProgram | undefined {
        if (this.has(shader)) return this.get(shader)!;
        const program: WebGLProgram = this.gl.createProgram(),
            { vertex, fragment } = shader;
        this.gl.attachShader(program, vertex);
        this.gl.attachShader(program, fragment);
        this.gl.linkProgram(program);
        // 检查链接状态
        const linkSuccess: boolean = !!this.gl.getProgramParameter(
            program,
            this.gl.LINK_STATUS,
        );
        if (!linkSuccess) {
            console.error(this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return void 0;
        }
        this.set(shader, program);
        return program;
    }
}
