import { type RoomType } from './types.js';

export type RoomSpec = {
    readonly key: string;
    readonly name: string;
    readonly type: RoomType;
    readonly d: number | 'fill';
    readonly isMerge?: boolean | undefined;
};

export type BandItem = {
    w: number;
    min?: number | undefined;
    max?: number | undefined;
    flex?: number | undefined;
    tag: string;
    drop?: number | undefined;
    isStair?: boolean | undefined;
    rooms: readonly (RoomSpec | null)[];
    xPos?: number | undefined;
    targetCells?: number | undefined;
};

export type BandSpec = {
    name: string;
    depth: number;
    items: BandItem[];
    isLdk?: boolean | undefined;
    core?: BandItem[] | null | undefined;
    service?: BandItem[] | null | undefined;
    tail?: BandItem[] | null | undefined;
    hallKey?: string | undefined;
};

export type LayoutContext = {
    readonly floorName: string;
    seq: number;
};
