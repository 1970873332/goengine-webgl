import { Texture } from "three";
import MapCache from "./base/Map";

/**
 * 纹理缓存
 */
export default class TextureCache extends MapCache<WebGLTexture> {
    /**
     * 默认纹理
     */
    protected declare defaultTexture: WebGLTexture;
    /**
     * 获取纹理
     */
    public texture(): WebGLTexture {
        return this.defaultTexture ??= this.gl.createTexture();
    }

    /**
     * 分配
     * @param target
     * @returns
     */
    public allocate(target: Texture, unit: number): WebGLTexture {
        const { uuid, image } = target;
        if (this.has(uuid)) return this.get(uuid)!;

        const texture: WebGLTexture = this.texture();
        if (!(image instanceof HTMLImageElement)) return texture;

        // 绑定纹理
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        // Y轴翻转纹理
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        // 加载纹理
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            image,
        );
        // 生成mipmap
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        // 设置纹理参数
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_S,
            this.gl.CLAMP_TO_EDGE,
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_WRAP_T,
            this.gl.CLAMP_TO_EDGE,
        );
        // 设置纹理过滤
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR_MIPMAP_LINEAR,
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MAG_FILTER,
            this.gl.LINEAR,
        );
        // 应用各向异性过滤
        const extension: EXT_texture_filter_anisotropic | null =
            this.gl.getExtension("EXT_texture_filter_anisotropic") ||
            this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
            this.gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
        extension &&
            this.gl.texParameterf(
                this.gl.TEXTURE_2D,
                extension.TEXTURE_MAX_ANISOTROPY_EXT,
                Math.min(
                    4.0,
                    this.gl.getParameter(
                        extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT,
                    ),
                ), // 4x各向异性过滤
            );
        this.set(uuid, texture);
        return texture;
    }
}
