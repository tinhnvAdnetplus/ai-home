import { TEXT_HEIGHT_NOTE_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion } from "./types.js";

export function writeScaleBar(
  writer: DxfWriter,
  x: number,
  y: number,
  scale: number,
  version: DxfVersion,
): void {
  const layer = "TITLE";
  const tickH = Math.round(2 * scale);
  const textH = TEXT_HEIGHT_NOTE_MM;
  const stops = [0, 1000, 2000, 5000];
  const maxStop = stops[stops.length - 1] ?? 5000;

  writer.writeLine(layer, x, y, x + maxStop, y, version);

  for (const s of stops) {
    const tx = x + s;
    writer.writeLine(layer, tx, y, tx, y + tickH, version);
    const label = s === 0 ? "0" : `${(s / 1000).toString()}m`;
    writer.writeText(
      layer,
      label,
      tx,
      y + tickH + 100,
      textH,
      0,
      1,
      1,
      version,
    );
  }

  const titleText = `SCALE 1:${scale.toString()}`;
  writer.writeText(
    layer,
    titleText,
    x + Math.round(maxStop / 2),
    y - Math.round(3 * scale),
    textH,
    0,
    1,
    2,
    version,
  );
}
