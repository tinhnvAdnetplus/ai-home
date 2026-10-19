import { type PlanInput } from './types.js';

export type MappingIssue = {
    readonly path: readonly (string | number)[];
    readonly code: string;
    readonly message: string;
    readonly level?: 'info' | 'warn' | 'error' | undefined;
};

export type Issue = MappingIssue;

export type AnswersMappingResult = {
    readonly input: PlanInput;
    readonly issues: Issue[];
};

export type UnconsumedFieldCategory =
    'styling_materials' | 'civil_structural' | 'crm_notes' | 'future_expansion';

export type UnconsumedFieldNote = {
    readonly key: string;
    readonly reason: string;
    readonly category: UnconsumedFieldCategory;
};

export type UnmappedPlanInputField = {
    readonly key: keyof PlanInput;
    readonly defaultValue: unknown;
    readonly rationale: string;
};

export type CoverageReport = {
    readonly totalWizardFields: number;
    readonly consumedWizardFields: readonly string[];
    readonly unconsumedWizardFields: readonly UnconsumedFieldNote[];
    readonly unmappedPlanInputFields: readonly UnmappedPlanInputField[];
};
