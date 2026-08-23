import type { ProbeDisplay } from '../common/ProbeResult';

function parseDisplayBlock(id: number, block: string): ProbeDisplay | undefined {
    const baseInfo = block.match(/mBaseDisplayInfo=DisplayInfo\{([^\n]+)\}/)?.[1];
    const overrideInfo = block.match(/mOverrideDisplayInfo=DisplayInfo\{([^\n]+)\}/)?.[1];
    const info = baseInfo ?? overrideInfo;
    if (!info) return;

    const name = info.match(/^"([^"]+)"/)?.[1] ?? block.match(/mPrimaryDisplayDevice=([^\n]+)/)?.[1]?.trim();
    const size = info.match(/\breal\s+(\d+)\s*x\s*(\d+)/);
    if (!size) return;

    const density = info.match(/\bdensity\s+(\d+(?:\.\d+)?)/)?.[1];
    const type = info.match(/\btype\s+([A-Z_]+)/)?.[1] ?? 'UNKNOWN';

    return {
        id,
        name: name || `Display ${id}`,
        width: Number.parseInt(size[1]!, 10),
        height: Number.parseInt(size[2]!, 10),
        density: density ? Number.parseFloat(density) : 0,
        type,
        isVirtual: type === 'VIRTUAL',
    };
}

/** Parse Android's "Logical Displays" section without depending on vendor-specific device sections. */
export function parseLogicalDisplays(output: string): ProbeDisplay[] {
    const sectionStart = output.indexOf('Logical Displays:');
    if (sectionStart === -1) return [];

    const remaining = output.slice(sectionStart);
    const sectionEnd = remaining.search(/^\s{2}(?:DeviceStateToLayoutMap|Display Devices):/m);
    const section = sectionEnd === -1 ? remaining : remaining.slice(0, sectionEnd);
    const header = /^\s{2}Display\s+(\d+):\s*$/gm;
    const matches = Array.from(section.matchAll(header));
    const displays: ProbeDisplay[] = [];

    for (let index = 0; index < matches.length; index += 1) {
        const match = matches[index]!;
        const id = Number.parseInt(match[1]!, 10);
        const start = (match.index ?? 0) + match[0].length;
        const end = matches[index + 1]?.index ?? section.length;
        const display = parseDisplayBlock(id, section.slice(start, end));
        if (display) displays.push(display);
    }

    return displays.sort((a, b) => a.id - b.id);
}
