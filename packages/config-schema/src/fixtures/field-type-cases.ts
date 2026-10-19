import { type FixtureCase } from './types.js';
import { fieldTypeTextCases } from './field-type-text-cases.js';
import { fieldTypeSingleChoiceCases } from './field-type-single-choice-cases.js';
import { fieldTypeMultiChoiceCases } from './field-type-multi-choice-cases.js';
import { fieldTypeOtherCases } from './field-type-other-cases.js';

export const fieldTypeCases: readonly FixtureCase[] = [
    ...fieldTypeTextCases,
    ...fieldTypeSingleChoiceCases,
    ...fieldTypeMultiChoiceCases,
    ...fieldTypeOtherCases,
];
