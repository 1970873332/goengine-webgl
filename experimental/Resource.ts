import Vector2 from "@goengine/core/src/object/math/vector/Vector2";
import { DocumentUtils } from "@goengine/core/experimental/util/Document";
import { Texture } from "three";

const textureContexts = [
    WebGLRenderingContext.TEXTURE1,
    WebGLRenderingContext.TEXTURE2,
    WebGLRenderingContext.TEXTURE3,
    WebGLRenderingContext.TEXTURE4,
    WebGLRenderingContext.TEXTURE5,
    WebGLRenderingContext.TEXTURE6,
    WebGLRenderingContext.TEXTURE7,
    WebGLRenderingContext.TEXTURE8,
    WebGLRenderingContext.TEXTURE9,
    WebGLRenderingContext.TEXTURE10,
    WebGLRenderingContext.TEXTURE11,
    WebGLRenderingContext.TEXTURE12,
    WebGLRenderingContext.TEXTURE13,
    WebGLRenderingContext.TEXTURE14,
    WebGLRenderingContext.TEXTURE15,
    WebGLRenderingContext.TEXTURE16,
    WebGLRenderingContext.TEXTURE17,
    WebGLRenderingContext.TEXTURE18,
    WebGLRenderingContext.TEXTURE19,
    WebGLRenderingContext.TEXTURE20,
    WebGLRenderingContext.TEXTURE21,
    WebGLRenderingContext.TEXTURE22,
    WebGLRenderingContext.TEXTURE23,
    WebGLRenderingContext.TEXTURE24,
    WebGLRenderingContext.TEXTURE25,
    WebGLRenderingContext.TEXTURE26,
    WebGLRenderingContext.TEXTURE27,
    WebGLRenderingContext.TEXTURE28,
    WebGLRenderingContext.TEXTURE29,
    WebGLRenderingContext.TEXTURE30,
    WebGLRenderingContext.TEXTURE31,
] as const;

/**
 * 纹理缓存
 */
export default class ResourceCache {
    public static readonly cacheID: string = "cacheID";
    /**
     * 最大轮询id
     */
    protected maxPollID: number = textureContexts.length;
    /**
     * 纹理映射
     */
    protected textures: ITextureGroup[] = Array(this.maxPollID)
        .fill(null)
        .map((_, index: number) => ({
            img: {
                data: new ImageData(1, 1),
                textureID: textureContexts[index],
            },
            map: new Map(),
        }));
    /**
     * 纹理元素
     */
    protected element: HTMLCanvasElement = DocumentUtils.createTextureCanvas();
    /**
     * 获取上下文
     */
    protected get ctx(): Canvas.Context2D | null {
        return this.element.getContext("2d", { willReadFrequently: true });
    }
    /**
     * 获取最小轮询id
     */
    protected get minPollGroupID(): number {
        const ids = this.textures.map(
            (group) => group.img.data.width + group.img.data.height,
        );
        return ids.indexOf(Math.min(...ids));
    }

    /**
     * 保存纹理
     * @param texture
     */
    public saveTexture(texture: Texture): ITextureGroup {
        const localGroup = this.getTexture(texture);
        if (localGroup) return localGroup;
        const id = this.minPollGroupID;
        const currentPollGroup = this.textures[id];
        const {
            img: { data },
        } = currentPollGroup;
        const { image } = texture;
        if (!(image instanceof HTMLImageElement)) return currentPollGroup;
        this.element.width = image.width + data.width;
        this.element.height = Math.max(image.height, data.height);
        this.ctx?.clearRect(0, 0, this.element.width, this.element.height);
        this.ctx?.putImageData(data, 0, 0);
        this.ctx?.drawImage(image, data.width, 0);
        texture.userData[ResourceCache.cacheID] = id;
        currentPollGroup.img = {
            data:
                this.ctx?.getImageData(
                    0,
                    0,
                    this.element.width,
                    this.element.height,
                ) ?? new ImageData(1, 1),
            textureID: textureContexts[id],
        };
        this.element.width = image.width;
        this.element.height = image.height;
        this.ctx?.clearRect(0, 0, this.element.width, this.element.height);
        this.ctx?.drawImage(image, 0, 0);
        currentPollGroup.map.set(texture.uuid, {
            offset: new Vector2(data.width, 0),
            size: new Vector2(image.width, image.height),
            data:
                this.ctx?.getImageData(
                    0,
                    0,
                    this.element.width,
                    this.element.height,
                ) ?? new ImageData(1, 1),
        });
        return currentPollGroup;
    }
    /**
     * 获取纹理
     * @param texture
     */
    public getTexture(texture: Texture): ITextureGroup | undefined {
        if (texture.userData[ResourceCache.cacheID]) {
            const textureData =
                this.textures[texture.userData[ResourceCache.cacheID]];
            if (textureData.map.has(texture.uuid)) return textureData;
        }
        return this.textures.find((group) => group.map.has(texture.uuid));
    }
    /**
     * 应用纹理
     * @param texture
     * @param gl
     * @returns
     */
    public applyTexture(
        texture: Texture,
        gl: Canvas.WebGLContext,
    ): ITextureGroup {
        const group = this.saveTexture(texture);
        const { img, map } = group;
        const mapData = map.get(texture.uuid);
        if (!mapData) return group;
        const { data } = mapData;
        gl.activeTexture(img.textureID);
        img.glTexture ??= gl.createTexture();
        if (!gl.isTexture(img.glTexture)) {
            gl.bindTexture(gl.TEXTURE_2D, img.glTexture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                data,
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE,
            );
            const ext = gl.getExtension("EXT_texture_filter_anisotropic");
            ext &&
                gl.texParameterf(
                    gl.TEXTURE_2D,
                    ext.TEXTURE_MAX_ANISOTROPY_EXT,
                    gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) ?? 16,
                );
        } else gl.bindTexture(gl.TEXTURE_2D, img.glTexture);
        return group;
    }
}

/**
 * 资源缓存管理器
 */
export class ResourceCacheManager {
    public static readonly resourceCacheTarget: ResourceCache =
        new ResourceCache();

    public static get target(): ResourceCache {
        return this.resourceCacheTarget;
    }

    /**
     * 绑定纹理到WebGL上下文
     * @param texture
     */
    public static bindTexture(
        texture: Texture | Texture[],
        gl: Canvas.WebGLContext,
    ) {
        const textures = Array.isArray(texture) ? texture : [texture];
        textures.forEach(({ image, userData }, index) => {
            userData["textureContext"] = textureContexts[index];
            const gl_texture = gl.createTexture();
            gl.activeTexture(textureContexts[index]);
            gl.bindTexture(gl.TEXTURE_2D, gl_texture);
            image instanceof HTMLImageElement &&
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    image,
                );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE,
            );
            const ext = gl.getExtension("EXT_texture_filter_anisotropic");
            ext &&
                gl.texParameterf(
                    gl.TEXTURE_2D,
                    ext.TEXTURE_MAX_ANISOTROPY_EXT,
                    gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT) ?? 16,
                );
        });
    }
}

interface ITextureGroup {
    /**
     * 图片选项
     */
    img: IImageOption;
    /**
     * 纹理选项映射
     */
    map: Map<string, ITextureOption>;
}

interface ITextureOption {
    /**
     * 纹理偏移
     */
    offset: Vector2;
    /**
     * 纹理尺寸
     */
    size: Vector2;
    /**
     * 纹理数据
     */
    data: ImageData;
}

interface IImageOption {
    /**
     * 图片数据
     */
    data: ImageData;
    /**
     * 纹理单元
     */
    textureID: (typeof textureContexts)[number];
    /**
     * WebGL纹理
     */
    glTexture?: WebGLTexture | null;
}
