import { describe, expect, it } from 'vitest';
import { parseLogicalDisplays } from '../displayListParser';

const SAMPLE = `
  Logical Displays: size=2
  Display 0:
    mDisplayId=0
    mPrimaryDisplayDevice=Built-in Screen
    mBaseDisplayInfo=DisplayInfo{"Built-in Screen", displayId 0", FLAG_SECURE, real 1080 x 1920, density 480 (320 x 320) dpi, type INTERNAL, uniqueId "local:0"}

  Display 2:
    mDisplayId=2
    mPrimaryDisplayDevice=OperatorVirtualDisplay:hearthstone
    mBaseDisplayInfo=DisplayInfo{"OperatorVirtualDisplay:hearthstone", displayId 2", FLAG_TRUSTED, real 1280 x 720, density 320 (320 x 320) dpi, type VIRTUAL, uniqueId "virtual:operator"}

  DeviceStateToLayoutMap:
    Registered Layouts:
`;

describe('parseLogicalDisplays', () => {
    it('returns physical and virtual logical displays', () => {
        expect(parseLogicalDisplays(SAMPLE)).toEqual([
            {
                id: 0,
                name: 'Built-in Screen',
                width: 1080,
                height: 1920,
                density: 480,
                type: 'INTERNAL',
                isVirtual: false,
            },
            {
                id: 2,
                name: 'OperatorVirtualDisplay:hearthstone',
                width: 1280,
                height: 720,
                density: 320,
                type: 'VIRTUAL',
                isVirtual: true,
            },
        ]);
    });

    it('returns an empty list when logical displays are unavailable', () => {
        expect(parseLogicalDisplays('Display Devices: size=1')).toEqual([]);
    });
});
