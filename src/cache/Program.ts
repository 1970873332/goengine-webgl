import ProgramState from "../state/Program";
import MapCache from "./base/Map";

/**
 * 程序状态缓存
 */
export default class ProgramStateCache extends MapCache<ProgramState> {

    /**
     * 存储
     * @param uuid 
     * @returns 
     */
    public obtain(uuid: string): ProgramState {
        if (this.has(uuid)) return this.get(uuid)!;

        const programState: ProgramState = new ProgramState();

        this.set(uuid, programState);

        return programState;
    }
}

