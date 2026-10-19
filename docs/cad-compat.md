# CAD Compatibility Guide (Jw_cad & AutoCAD LT)

This document details the DXF export specifications, verified structural rules, and compatibility considerations for Jw_cad, AutoCAD LT, and modern CAD software.

---

## 1. Supported DXF Versions

| Version | ACADVER | Description & Best Use |
| :--- | :--- | :--- |
| **R2000** (Default) | `AC1015` | Default modern standard. Supports `LWPOLYLINE`, entity handles, layer lineweights (`370`), and named object dictionary. Recommended for AutoCAD, AutoCAD LT, DraftSight, and modern viewers. |
| **R12** | `AC1009` | Maximum backward compatibility. Converts `LWPOLYLINE` to standard `POLYLINE` + `VERTEX` + `SEQEND`. No object handles required. Uses `$DWGCODEPAGE ANSI_932` for Shift_JIS text encoding. Safest for older versions of Jw_cad. |

### File Naming Convention
Helper `dxfFileName(model, options)` supports version tags while remaining backwards compatible:
- Default: `<prefix>-seed<seed>-all.dxf` or `<prefix>-seed<seed>-f<floor>.dxf`
- Explicit version: `<prefix>-seed<seed>-all-r2000.dxf` / `<prefix>-seed<seed>-all-r12.dxf`

---

## 2. Drawing Quality & Layer Standards

Architectural elements are exported with standard AutoCAD Color Index (ACI) and lineweights:

| Layer | ACI Color | Color Name | Lineweight (mm) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `0` | 7 | White | 0.25 | Standard default base layer |
| `F*-WALL-EXT` | 4 | Cyan | 0.50 | Exterior walls (closed double-line polylines) |
| `F*-WALL-INT` | 7 | White | 0.25 | Interior partitions (closed double-line polylines) |
| `F*-DOOR` | 3 | Green | 0.18 | Single doors (leaf + swing arc), sliding doors |
| `F*-WINDOW` | 5 | Blue | 0.18 | Window openings (3-line architectural symbol) |
| `F*-ROOM` | 6 | Magenta | 0.18 | Room boundaries |
| `F*-STAIR` | 2 | Yellow | 0.25 | Stair treads, direction arrow, "UP" label |
| `F*-TEXT` | 7 | White | 0.18 | Room names (220mm) and areas (160mm) |
| `F*-DIM` | 1 | Red | 0.13 | Dimension chains with lines and ticks |
| `SITE` | 2 | Yellow | 0.25 | Property boundary, road boundary & width text |
| `TITLE` | 7 | White | 0.25 | A3 sheet frame, title block, North arrow, scale bar |

### Sheet Frame & Title Block
- **Paper Frame**: A3 landscape (420 x 297 mm) at 1:100 scale = 42,000 x 29,700 mm model units.
- **Extents**: Header `$EXTMIN` and `$EXTMAX` align with the A3 sheet border.
- **North Arrow**: Circle with directional arrow pointing +Y (North) and "N" designation.
- **Graphic Scale Bar**: 0 to 5m graphical scale with 1m and 2m divisions, labeled `SCALE 1:100`.
- **Title Block**: Contains Project Name, "AI HOME PLATFORM", Drawing Title, Date, Sheet Number, and Scale.

---

## 3. What Was Verified (Automated Audit)

### 3.1 Python `ezdxf` 1.4.4 Audit
- Initial audit of R2000 DXF identified 0 structural errors in recover mode across ~300 entities.
- Identified defect: `INVALID_OWNER_HANDLE (#202): Fixed invalid owner handle in root DICTIONARY`.
- **Resolution**: Fixed in `writeObjectsSection` by assigning group code `330` with value `"0"` to root `DICTIONARY` (in AutoCAD R2000 specification, the root named object dictionary has owner `0`).

### 3.2 TypeScript Structural Audit (`scripts/audit.ts`)
Automated audit tests 6 configurations (Default 2-storey, 1-storey, narrow-lot plan across both R2000 and R12):
1. **Unique handles**: All entity and table handles are strictly unique.
2. **Owner handles**: Every group `330` pointer references a valid existing handle (or `"0"` for root dictionary).
3. **`$HANDSEED`**: Strictly greater than the maximum handle allocated in the drawing.
4. **Drawing units**: `$INSUNITS` = 4 (millimeters), `$MEASUREMENT` = 1 (metric).
5. **Required sections**: `HEADER`, `TABLES`, `BLOCKS`, `ENTITIES`, `OBJECTS` present in R2000; proper section nesting.
6. **Block records**: `*MODEL_SPACE` and `*PAPER_SPACE` records exist in `BLOCK_RECORD` table.
7. **Layer table integrity**: Every entity references a layer defined in `TABLE LAYER`.
8. **Data integrity**: No `NaN`, `Infinity`, `undefined`, or `null` values.
9. **Extents**: Outer frame measures exactly 42,000 x 29,700 mm matching `$EXTMIN`/`$EXTMAX`.
10. **Color values**: All ACI color numbers are in 1–255.
11. **Text encoding**: Shift_JIS safe (`\U+XXXX` and `$DWGCODEPAGE ANSI_932`).
12. **End of File**: Clean `EOF` marker.

---

## 4. What Is NOT Verified

- **Live GUI testing in desktop CAD**: Opening files in native desktop CAD applications (Jw_cad, AutoCAD LT, DraftSight) on Windows/macOS has **not** been executed in this automated server environment.
- **Font rendering**: Visual font appearance depends on local CAD font mappings (e.g., standard Windows MS Gothic / MS Mincho for Japanese text).

---

## 5. 10-Line Manual Checklist for Jw_cad Reviewer

1. **Open File**: Launch Jw_cad, select `File` > `DXF Read` (`DXF読込`), and open the exported `.dxf` file.
2. **Scale & Units**: Confirm drawing scale is set to `1/100` and units are in `mm`.
3. **Layers**: Open Layer dialog; verify layers (`F1-WALL-EXT`, `F1-WALL-INT`, `F1-DOOR`, `F1-WINDOW`, `TITLE`, etc.) are separated with distinct colors.
4. **Text Encoding**: Verify Japanese room labels (LDK, 洋室, 浴室, 玄関) and site text (道路 幅員) display clearly without character corruption.
5. **Dimension Verification**: Use the measurement tool (`寸法` / `距離測定`) on a known 3,640 mm wall grid module; verify it measures exactly 3,640 mm.
6. **Wall Representation**: Check that walls render as closed double lines with exterior walls (0.5 mm) distinct from interior partitions (0.25 mm).
7. **Door & Window Symbols**: Verify doors show leaf lines with 90° swing arcs, and windows display as 3 parallel lines across openings.
8. **Stairs & Notes**: Verify stair treads display step lines, walking line with directional arrow, and "UP" label.
9. **Title & Orientation**: Confirm the North arrow points upward (+Y), scale bar shows 0–5m markings, and title block displays project metadata.
10. **Print Preview**: Open Print Preview (`印刷プレビュー`) with A3 Landscape at 1:100; confirm the entire drawing and outer border fit within the printable sheet.
