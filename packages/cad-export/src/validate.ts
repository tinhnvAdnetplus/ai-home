import { type DxfValidationResult } from "./types.js";

export function validateDxfStructure(text: string): DxfValidationResult {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/);
  let sectionDepth = 0;
  let hasEof = false;
  let currentSection = "";
  let currentTable = "";
  let currentEntity = "";
  let lastVarName = "";
  let handseedVal = "";
  let acadVer = "";
  let insunits = -1;
  let measurement = -1;

  const seenHandles = new Set<string>();
  const ownerPointers: string[] = [];
  const definedLayers = new Set<string>();
  const usedLayers = new Set<string>();
  const sectionsFound = new Set<string>();
  const blockRecords = new Set<string>();
  const entitiesByLayer: Record<string, number> = {};
  const entitiesByType: Record<string, number> = {};
  let totalEntities = 0;

  for (let i = 0; i < lines.length - 1; i += 2) {
    const rawCode = lines[i]?.trim();
    const rawVal = lines[i + 1]?.trim();
    if (rawCode === undefined || rawVal === undefined) break;
    if (rawCode === "" && rawVal === "") continue;

    const code = Number(rawCode);
    if (Number.isNaN(code)) errors.push(`Invalid code: ${rawCode}`);
    if (
      rawVal.includes("NaN") ||
      rawVal.includes("Infinity") ||
      rawVal.includes("undefined") ||
      rawVal.includes("null")
    ) {
      errors.push(`NaN/Infinity found at line ${(i + 2).toString()}`);
    }

    if (code === 0) {
      if (rawVal === "SECTION") {
        sectionDepth += 1;
      } else if (rawVal === "ENDSEC") {
        sectionDepth -= 1;
        currentSection = "";
      } else if (rawVal === "EOF") {
        hasEof = true;
      } else if (rawVal === "TABLE") {
        currentTable = "";
      } else if (rawVal === "ENDTAB") {
        currentTable = "";
      } else if (currentSection === "ENTITIES") {
        currentEntity = rawVal;
        totalEntities += 1;
        entitiesByType[rawVal] = (entitiesByType[rawVal] ?? 0) + 1;
      }
    } else if (code === 2) {
      if (sectionDepth === 1 && currentSection === "") {
        currentSection = rawVal;
        sectionsFound.add(rawVal);
      } else if (currentSection === "TABLES" && currentTable === "") {
        currentTable = rawVal;
      } else if (currentTable === "LAYER") {
        definedLayers.add(rawVal);
      } else if (currentTable === "BLOCK_RECORD") {
        blockRecords.add(rawVal);
      }
    } else if (code === 5) {
      const upper = rawVal.toUpperCase();
      if (lastVarName === "$HANDSEED") {
        handseedVal = upper;
      } else if (seenHandles.has(upper)) {
        errors.push(`Duplicate handle: ${rawVal}`);
      } else {
        seenHandles.add(upper);
      }
    } else if (code === 330) {
      ownerPointers.push(rawVal.toUpperCase());
    } else if (code === 8 && currentSection === "ENTITIES") {
      usedLayers.add(rawVal);
      if (currentEntity !== "") {
        entitiesByLayer[rawVal] = (entitiesByLayer[rawVal] ?? 0) + 1;
      }
    } else if (code === 9) {
      lastVarName = rawVal;
    } else if (code === 1 && lastVarName === "$ACADVER") {
      acadVer = rawVal;
    } else if (code === 70 && lastVarName === "$INSUNITS") {
      insunits = Number(rawVal);
    } else if (code === 70 && lastVarName === "$MEASUREMENT") {
      measurement = Number(rawVal);
    } else if (code === 62) {
      const c = Number(rawVal);
      if (Number.isNaN(c) || c < 1 || c > 255) {
        errors.push(`Invalid ACI color: ${rawVal}`);
      }
    }
  }

  if (sectionDepth !== 0) errors.push("Unbalanced SECTION/ENDSEC");
  if (!hasEof) errors.push("Missing EOF tag");
  if (insunits !== 4)
    errors.push(`$INSUNITS must be 4, got ${insunits.toString()}`);
  if (measurement !== 1)
    errors.push(`$MEASUREMENT must be 1, got ${measurement.toString()}`);

  const isR12 = acadVer === "AC1009";
  if (!isR12) {
    for (const s of ["HEADER", "TABLES", "BLOCKS", "ENTITIES", "OBJECTS"]) {
      if (!sectionsFound.has(s)) errors.push(`Missing section: ${s}`);
    }
    for (const br of ["*MODEL_SPACE", "*PAPER_SPACE"]) {
      if (!blockRecords.has(br)) errors.push(`Missing BLOCK_RECORD: ${br}`);
    }
    for (const ptr of ownerPointers) {
      if (ptr !== "0" && !seenHandles.has(ptr)) {
        errors.push(`Owner handle does not exist: ${ptr}`);
      }
    }
    if (handseedVal !== "") {
      const hs = parseInt(handseedVal, 16);
      let maxH = 0;
      for (const h of seenHandles) {
        const v = parseInt(h, 16);
        if (v > maxH) maxH = v;
      }
      if (hs <= maxH)
        errors.push(
          `$HANDSEED (${handseedVal}) <= max handle (${maxH.toString(16)})`,
        );
    }
  }

  for (const lyr of usedLayers) {
    if (!definedLayers.has(lyr))
      errors.push(`Entity uses undefined layer: ${lyr}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    entityCount: totalEntities,
    handleCount: seenHandles.size,
    entitiesByLayer,
    entitiesByType,
  };
}
