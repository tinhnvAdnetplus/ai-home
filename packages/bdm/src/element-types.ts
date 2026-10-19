export const ROOM_TYPES = [
    'ldk',
    'living',
    'dining',
    'kitchen',
    'bedroom',
    'childRoom',
    'washitsu',
    'bath',
    'wash',
    'toilet',
    'entrance',
    'hall',
    'corridor',
    'stairs',
    'storage',
    'closet',
    'walkInCloset',
    'pantry',
    'laundry',
    'study',
    'balcony',
    'void',
    'guest',
    'hobby',
    'porch',
    'deck',
    'elevator',
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export const WALL_KINDS = ['exterior', 'interior'] as const;
export type WallKind = (typeof WALL_KINDS)[number];

export const OPENING_KINDS = [
    'door',
    'slidingDoor',
    'window',
    'largeWindow',
    'entrance',
] as const;
export type OpeningKind = (typeof OPENING_KINDS)[number];

export const ROOF_KINDS = ['gabled', 'hipped', 'shed', 'flat'] as const;
export type RoofKind = (typeof ROOF_KINDS)[number];

export const PARKING_KINDS = ['surface', 'carport', 'garage'] as const;
export type ParkingKind = (typeof PARKING_KINDS)[number];

export const ROAD_SIDES = [
    'north',
    'south',
    'east',
    'west',
    '北',
    '南',
    '東',
    '西',
] as const;
export type RoadSide = (typeof ROAD_SIDES)[number];

export const EXTERIOR_WALL_COLORS = [
    'white',
    'beige',
    'gray',
    'brown',
    'black',
    'navy',
] as const;
export type ExteriorWallColor = (typeof EXTERIOR_WALL_COLORS)[number];

export const EXTERIOR_ROOF_COLORS = [
    'black',
    'gray',
    'brown',
    'navy',
    'green',
] as const;
export type ExteriorRoofColor = (typeof EXTERIOR_ROOF_COLORS)[number];

export const EXTERIOR_ACCENT_COLORS = [
    'wood',
    'white',
    'beige',
    'gray',
    'brown',
    'black',
] as const;
export type ExteriorAccentColor = (typeof EXTERIOR_ACCENT_COLORS)[number];

