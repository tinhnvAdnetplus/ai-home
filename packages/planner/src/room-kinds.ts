/** Rooms that are open to each other (no partition wall, no door): halls, corridors, entrance, stairs, LDK. */
export const OPEN_ROOM_TYPES: ReadonlySet<string> = new Set([
    'hall',
    'corridor',
    'entrance',
    'stairs',
    'ldk',
    'void',
]);
