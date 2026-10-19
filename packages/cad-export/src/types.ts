export type DxfVersion = "R2000" | "2000" | "R12";

export type DxfEncoding = "ascii" | "utf8";

export type PaperSize = "A4" | "A3" | "A2" | "A1";

export type TitleBlockInfo = {
  readonly projectName?: string | undefined;
  readonly drawingTitle?: string | undefined;
  readonly architect?: string | undefined;
  readonly date?: string | undefined;
  readonly sheetNumber?: string | undefined;
};

export type ExportDxfOptions = {
  readonly floors?: readonly number[] | undefined;
  readonly paperSize?: PaperSize | undefined;
  readonly scale?: number | undefined;
  readonly hasDimensions?: boolean | undefined;
  readonly hasSite?: boolean | undefined;
  readonly hasTitleBlock?: boolean | undefined;
  readonly dxfVersion?: DxfVersion | undefined;
  readonly version?: DxfVersion | undefined;
  readonly textEncoding?: DxfEncoding | undefined;
  readonly titleBlockInfo?: TitleBlockInfo | undefined;
};

export type DxfFileNameOptions = {
  readonly floorLevel?: number | undefined;
  readonly prefix?: string | undefined;
  readonly version?: DxfVersion | undefined;
  readonly dxfVersion?: DxfVersion | undefined;
};

export type DxfValidationResult = {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly entityCount: number;
  readonly handleCount: number;
  readonly entitiesByLayer: Readonly<Record<string, number>>;
  readonly entitiesByType: Readonly<Record<string, number>>;
};

export type LayerDef = {
  readonly name: string;
  readonly color: number;
  readonly lineweight?: number | undefined;
};

export type Point2D = {
  readonly x: number;
  readonly y: number;
};

export type BoundingBox2D = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};
