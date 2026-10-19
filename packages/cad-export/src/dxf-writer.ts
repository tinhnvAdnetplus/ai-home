import { type DxfVersion, type Point2D } from "./types.js";

function isR12(version: DxfVersion): boolean {
  return version === "R12";
}

export class DxfWriter {
  private readonly lines: string[] = [];
  private currentHandle = 16;
  private handseedIndex = -1;

  public nextHandle(): string {
    const hex = this.currentHandle.toString(16).toUpperCase();
    this.currentHandle += 1;
    return hex;
  }

  public push(code: number, value: string | number): void {
    this.lines.push(code.toString(), value.toString());
  }

  public reserveHandseed(): void {
    this.push(9, "$HANDSEED");
    this.handseedIndex = this.lines.length + 1;
    this.push(5, "FFFF");
  }

  public getHandseed(): string {
    return this.currentHandle.toString(16).toUpperCase();
  }

  public toDxfString(): string {
    if (this.handseedIndex >= 0 && this.handseedIndex < this.lines.length) {
      this.lines[this.handseedIndex] = this.getHandseed();
    }
    return this.lines.join("\r\n") + "\r\n";
  }

  public writeLine(
    layer: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    version: DxfVersion,
  ): void {
    this.push(0, "LINE");
    if (!isR12(version)) {
      this.push(5, this.nextHandle());
      this.push(100, "AcDbEntity");
    }
    this.push(8, layer);
    if (!isR12(version)) this.push(100, "AcDbLine");
    this.push(10, x1);
    this.push(20, y1);
    this.push(30, 0.0);
    this.push(11, x2);
    this.push(21, y2);
    this.push(31, 0.0);
  }

  public writePolyline(
    layer: string,
    points: readonly Point2D[],
    isClosed: boolean,
    version: DxfVersion,
  ): void {
    if (points.length === 0) return;
    if (!isR12(version)) {
      this.push(0, "LWPOLYLINE");
      this.push(5, this.nextHandle());
      this.push(100, "AcDbEntity");
      this.push(8, layer);
      this.push(100, "AcDbPolyline");
      this.push(90, points.length);
      this.push(70, isClosed ? 1 : 0);
      this.push(43, 0.0);
      for (const pt of points) {
        this.push(10, pt.x);
        this.push(20, pt.y);
      }
      return;
    }
    this.push(0, "POLYLINE");
    this.push(8, layer);
    this.push(66, 1);
    this.push(70, isClosed ? 1 : 0);
    for (const pt of points) {
      this.push(0, "VERTEX");
      this.push(8, layer);
      this.push(10, pt.x);
      this.push(20, pt.y);
      this.push(30, 0.0);
    }
    this.push(0, "SEQEND");
    this.push(8, layer);
  }

  public writeArc(
    layer: string,
    cx: number,
    cy: number,
    radius: number,
    startDeg: number,
    endDeg: number,
    version: DxfVersion,
  ): void {
    this.push(0, "ARC");
    if (!isR12(version)) {
      this.push(5, this.nextHandle());
      this.push(100, "AcDbEntity");
    }
    this.push(8, layer);
    if (!isR12(version)) this.push(100, "AcDbCircle");
    this.push(10, cx);
    this.push(20, cy);
    this.push(30, 0.0);
    this.push(40, radius);
    if (!isR12(version)) this.push(100, "AcDbArc");
    this.push(50, startDeg);
    this.push(51, endDeg);
  }

  public writeText(
    layer: string,
    text: string,
    x: number,
    y: number,
    height: number,
    rot: number,
    hJust: number,
    vJust: number,
    version: DxfVersion,
  ): void {
    this.push(0, "TEXT");
    if (!isR12(version)) {
      this.push(5, this.nextHandle());
      this.push(100, "AcDbEntity");
    }
    this.push(8, layer);
    if (!isR12(version)) this.push(100, "AcDbText");
    this.push(10, x);
    this.push(20, y);
    this.push(30, 0.0);
    this.push(40, height);
    this.push(1, text);
    this.push(50, rot);
    this.push(72, hJust);
    this.push(11, x);
    this.push(21, y);
    this.push(31, 0.0);
    if (!isR12(version)) this.push(100, "AcDbText");
    this.push(73, vJust);
  }
}
