export type AnswerValue = string | number | boolean | null | string[];

export type EvaluateSafeResult =
    | ({ ok: true } & Record<'value', boolean>)
    | { ok: false; reason: 'INVALID_CONDITION' | 'INVALID_ANSWERS' };

export type WizardState = {
    visible: Record<string, boolean>;
    disabled: Record<string, boolean>;
    disabledOptions: Record<string, readonly string[]>;
    answers: Record<string, unknown>;
    missingRequired: string[];
};
