import { type FixtureCase } from './types.js';
import { hostileProtoCases } from './hostile-proto-cases.js';
import { hostileInputCases } from './hostile-input-cases.js';

export const hostileCases: readonly FixtureCase[] = [
    ...hostileProtoCases,
    ...hostileInputCases,
];
