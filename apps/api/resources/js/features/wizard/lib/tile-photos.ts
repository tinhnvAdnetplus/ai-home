const TILE_URLS: Readonly<Record<string, string>> = import.meta.glob(
    '../assets/generated/tiles/*.jpg',
    { eager: true, query: '?url', import: 'default' },
);

/** Photo for a tile by file name without extension (e.g. `room-ldk`); undefined while the image does not exist yet. */
export function getTilePhoto(name: string): string | undefined {
    return TILE_URLS[`../assets/generated/tiles/${name}.jpg`];
}
