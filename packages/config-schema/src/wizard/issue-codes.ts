export const ISSUE_CODES = [
    'SCHEMA_INVALID',
    'DUPLICATE_KEY',
    'UNKNOWN_FIELD_REF',
    'SELF_REFERENCE',
    'CONDITION_CYCLE',
    'UNKNOWN_BINDING',
    'BINDING_TYPE_MISMATCH',
    'DUPLICATE_BINDING',
    'DEFAULT_NOT_IN_OPTIONS',
    'DEFAULT_OUT_OF_RANGE',
    'RANGE_INVALID',
    'SELECTION_LIMITS_INVALID',
    'EMPTY_OPTIONS',
    'LIMIT_EXCEEDED',
] as const;

export type IssueCode = (typeof ISSUE_CODES)[number];

export type Issue = {
    readonly path: readonly (string | number)[];
    readonly code: IssueCode;
    readonly message: string;
};
