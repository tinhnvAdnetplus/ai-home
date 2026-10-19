import * as fs from "node:fs";
import * as path from "node:path";
import { generatePlansSafe } from "@aihome/planner";
import { renderAllElevations } from "../src/index.js";

function findWorkspaceRoot(startDir: string): string {
  let curr = startDir;
  while (curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, "pnpm-workspace.yaml"))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return startDir;
}

const rootDir = findWorkspaceRoot(process.cwd());
const outDir = path.resolve(rootDir, "docs/design/current/elevations");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cases = [
  {
    name: "1storey",
    input: {
      frontage: 10,
      landDepth: 12,
      landAreaTsubo: 40,
      roadSide: "南",
      floors: 1,
      targetArea: 24,
      ldkSize: 18,
      masterSize: 8,
      kidsRooms: 1,
      kidsSize: 6,
      toilets: 1,
      bathSize: "1坪",
      bathFloor: "1階",
      washCount: 1,
      cars: 1,
    },
  },
  {
    name: "2storey",
    input: {
      frontage: 8.5,
      landDepth: 11,
      landAreaTsubo: 35,
      roadSide: "南",
      floors: 2,
      targetArea: 32,
      ldkSize: 18,
      masterSize: 8,
      kidsRooms: 2,
      kidsSize: 5.5,
      toilets: 2,
      bathSize: "1坪",
      bathFloor: "1階",
      washCount: 1,
      cars: 1,
    },
  },
  {
    name: "narrow",
    input: {
      frontage: 5.5,
      landDepth: 14,
      landAreaTsubo: 25,
      roadSide: "南",
      floors: 2,
      targetArea: 28,
      ldkSize: 16,
      masterSize: 6,
      kidsRooms: 2,
      kidsSize: 4.5,
      toilets: 2,
      bathSize: "1坪",
      bathFloor: "1階",
      washCount: 1,
      cars: 1,
    },
  },
];

for (const c of cases) {
  const res = generatePlansSafe(c.input);
  if (!res.ok) {
    throw new Error(
      `Failed to generate plan for ${c.name}: ${JSON.stringify(res.issues)}`,
    );
  }

  const firstPlan = res.data.plans[0];
  const model = firstPlan.model;
  const elevations = renderAllElevations(model);

  for (const [side, svg] of Object.entries(elevations)) {
    const filePath = path.join(outDir, `${c.name}-${side}.svg`);
    fs.writeFileSync(filePath, svg, "utf-8");
    console.log(`Wrote: ${filePath}`);
  }
}

console.log("Demo completed successfully: 12 elevation SVGs generated.");
