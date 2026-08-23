export interface ProbeDisplay {
    id: number;
    name: string;
    width: number;
    height: number;
    density: number;
    type: string;
    isVirtual: boolean;
}

export interface ProbeResult {
    width: number;
    height: number;
    density: number;
    sdkInt: number;
    displays: ProbeDisplay[];
    videoEncoders: string[];
    audioEncoders: string[];
}
