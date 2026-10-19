import { generatePlansSafe } from "../../planner/src/index.js";
import {
  exportDxf,
  validateDxfStructure,
  type DxfVersion,
} from "../src/index.js";

declare const process: {
  stdout: { write(str: string): boolean };
  stderr: { write(str: string): boolean };
  exit(code?: number): never;
};

type AuditRow = {
  readonly planName: string;
  readonly version: DxfVersion;
  readonly entities: number;
  readonly handles: number;
  readonly layers: number;
  readonly widthMm: number;
  readonly heightMm: number;
  readonly isValid: boolean;
  readonly errors: readonly string[];
};

function extractExtents(dxf: string): { widthMm: number; heightMm: number } {
  const lines = dxf.split(/\r?\n/);
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  let lastVar = "";

  for (let i = 0; i < lines.length - 1; i += 2) {
    const code = Number(lines[i]?.trim());
    const val = lines[i + 1]?.trim() ?? "";
    if (code === 0) lastVar = "";
    if (code === 9) lastVar = val;
    if (lastVar === "$EXTMIN") {
      if (code === 10) minX = Number(val);
      if (code === 20) minY = Number(val);
    }
    if (lastVar === "$EXTMAX") {
      if (code === 10) maxX = Number(val);
      if (code === 20) maxY = Number(val);
    }
  }

  return {
    widthMm: Math.round(maxX - minX),
    heightMm: Math.round(maxY - minY),
  };
}

function runAudit(): void {
  process.stdout.write("========================================\n");
  process.stdout.write("CAD EXPORT AUDIT: R2000 & R12 STRUCTURE\n");
  process.stdout.write("========================================\n\n");

  const planConfigs = [
    { name: "Default 2-Storey", input: {} },
    {
      name: "1-Storey Plan",
      input: { "building.floors": 1, floors: 1 },
    },
    {
      name: "Narrow-Lot Plan",
      input: {
        frontage: 5,
        landDepth: 20,
        "site.frontage": 5,
        "site.depth": 20,
      },
    },
  ];

  const versions: readonly DxfVersion[] = ["R2000", "R12"];
  const rows: AuditRow[] = [];
  let totalErrors = 0;

  for (const cfg of planConfigs) {
    const res = generatePlansSafe(cfg.input);
    if (!res.ok) {
      process.stderr.write(`Failed to generate ${cfg.name}\n`);
      return process.exit(1);
    }
    const plan = res.data.plans[0];
    if (!plan) {
      process.stderr.write(`No plan generated for ${cfg.name}\n`);
      return process.exit(1);
    }

    for (const ver of versions) {
      const dxf = exportDxf(plan.model, { version: ver });
      const val = validateDxfStructure(dxf);
      const ext = extractExtents(dxf);

      const auditErrors = [...val.errors];
      if (ext.widthMm !== 42000 || ext.heightMm !== 29700) {
        auditErrors.push(
          `Extents mismatch: expected 42000x29700, got ${ext.widthMm.toString()}x${ext.heightMm.toString()}`,
        );
      }

      if (ver === "R2000") {
        if (!dxf.includes("\r\n330\r\n0\r\n100\r\nAcDbDictionary\r\n")) {
          auditErrors.push(
            "Root DICTIONARY missing owner handle 0 (defect reproduced)",
          );
        }
      }

      const isValid = auditErrors.length === 0;
      if (!isValid) totalErrors += auditErrors.length;

      rows.push({
        planName: cfg.name,
        version: ver,
        entities: val.entityCount,
        handles: val.handleCount,
        layers: Object.keys(val.entitiesByLayer).length,
        widthMm: ext.widthMm,
        heightMm: ext.heightMm,
        isValid,
        errors: auditErrors,
      });
    }
  }

  process.stdout.write(
    "Plan Name           | Ver   | Entities | Handles | Layers | Extents (mm)   | Status\n",
  );
  process.stdout.write(
    "--------------------+-------+----------+---------+--------+----------------+-------\n",
  );

  for (const r of rows) {
    const p = r.planName.padEnd(19, " ");
    const v = r.version.padEnd(5, " ");
    const e = r.entities.toString().padStart(8, " ");
    const h = r.handles.toString().padStart(7, " ");
    const l = r.layers.toString().padStart(6, " ");
    const ext = `${r.widthMm.toString()}x${r.heightMm.toString()}`.padStart(
      14,
      " ",
    );
    const s = r.isValid ? "PASS" : "FAIL";
    process.stdout.write(`${p} | ${v} | ${e} | ${h} | ${l} | ${ext} | ${s}\n`);

    if (!r.isValid) {
      for (const err of r.errors) {
        process.stdout.write(`  -> ERROR: ${err}\n`);
      }
    }
  }

  process.stdout.write("\nAudit Summary: ");
  if (totalErrors === 0) {
    process.stdout.write("ALL 6 EXPORTS PASSED STRUCTURAL AUDIT.\n");
    process.stdout.write(
      "Fixed owner handle defect: root DICTIONARY has owner handle 0.\n",
    );
    process.stdout.write(
      "Extents verified: 42.0m x 29.7m (A3 frame at 1:100 scale).\n",
    );
  } else {
    process.stdout.write(`FAILED with ${totalErrors.toString()} errors.\n`);
    process.exit(1);
  }
}

runAudit();
