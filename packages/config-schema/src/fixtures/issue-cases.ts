import { type FixtureCase } from './types.js';
import { issueSchemaCases } from './issue-schema-cases.js';
import { issueRefCases } from './issue-ref-cases.js';
import { issueBindingCases } from './issue-binding-cases.js';
import { issueDefaultCases } from './issue-default-cases.js';
import { issueLimitCases } from './issue-limit-cases.js';

export const issueCases: readonly FixtureCase[] = [
    ...issueSchemaCases,
    ...issueRefCases,
    ...issueBindingCases,
    ...issueDefaultCases,
    ...issueLimitCases,
];
