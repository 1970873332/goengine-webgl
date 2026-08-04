import { ShaderStateAny } from "../state/Shader";
import MapCache from "./base/Map";

/**
 * 程序缓存
 */
export default class ProgramCache extends MapCache<WebGLProgram> {
    /**
     * 分配
     * @param shader
     * @returns
     */
    public allocate(
        shader: WebGL.Shader<ShaderStateAny>,
    ): WebGLProgram | undefined {
        if (this.has(shader.id)) return this.get(shader.id)!;
        const program: WebGLProgram = this.gl.createProgram(),
            {
                vertex: { webglShader: vertexShader },
                fragment: { webglShader: fragmentShader },
            } = shader;
        vertexShader && this.gl.attachShader(program, vertexShader);
        fragmentShader && this.gl.attachShader(program, fragmentShader);
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
        this.set(shader.id, program);
        return program;
    }
}
