import WeakMapCache from "./base/WeakMap";

export default class LocationCache extends WeakMapCache<WebGLProgram, Record<string, WebGLUniformLocation | number>> { }