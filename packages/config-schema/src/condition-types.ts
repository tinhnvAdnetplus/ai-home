import { type Key } from './primitives.js';

export const MAX_CONDITION_DEPTH = 6;
export const MAX_CONDITION_NODES = 60;
export const MAX_IN_ITEMS = 50;

export const ALLOWED_OPERATORS = [
    'and',
    'or',
    '!',
    '==',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'in',
] as const;

export type AllowedOperator = (typeof ALLOWED_OPERATORS)[number];

export type ScalarLiteral = string | number | boolean | null;

export type VarNode = {
    var: Key;
};

export type Condition =
    | ScalarLiteral
    | VarNode
    | { and: Condition[] }
    | { or: Condition[] }
    | { '!': [Condition] }
    | { '==': [Condition, Condition] }
    | { '!=': [Condition, Condition] }
    | { '<': [Condition, Condition] }
    | { '<=': [Condition, Condition] }
    | { '>': [Condition, Condition] }
    | { '>=': [Condition, Condition] }
    | { in: [Condition, VarNode | ScalarLiteral[]] };
