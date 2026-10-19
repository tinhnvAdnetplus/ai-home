import { type FixtureCase } from './types.js';
import { boundaryStructuralCases } from './boundary-structural-cases.js';
import { boundaryConditionCases } from './boundary-condition-cases.js';
import { boundaryTextCases } from './boundary-text-cases.js';

export const boundaryCases: readonly FixtureCase[] = [
    ...boundaryStructuralCases,
    ...boundaryConditionCases,
    ...boundaryTextCases,
];
