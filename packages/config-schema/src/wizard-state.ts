import { type WizardConfig } from './wizard/wizard-schema.js';
import { type Field } from './wizard/field-schemas.js';
import { type WizardState } from './answer-types.js';
import { isStrictEqual, readVar } from './answer-normalize.js';
import { evaluateCondition } from './condition-evaluator.js';
import {
    collectFields,
    filterDisabledOptions,
    isAnswerEmpty,
} from './wizard-state-helpers.js';

function hasOwnKey(source: unknown, key: string): boolean {
    try {
        return (
            typeof source === 'object' &&
            source !== null &&
            Object.hasOwn(source, key)
        );
    } catch {
        return false;
    }
}

export function resolveWizardState(
    wizard: WizardConfig,
    answers: Record<string, unknown>,
): WizardState {
    const allFields = collectFields(wizard);
    const fieldMap = new Map<string, Field>();
    for (const field of allFields) {
        fieldMap.set(field.key, field);
    }

    // Only the wizard's own field keys are read (cost does not depend on how many keys the input has), and every read is
    // guarded: a hostile getter / Proxy must degrade to "no answer", never throw.
    const currentAnswers: Record<string, unknown> = {};
    for (const key of fieldMap.keys()) {
        if (hasOwnKey(answers, key)) {
            currentAnswers[key] = readVar(answers, key);
        }
    }

    const maxPasses = allFields.length + 1;
    let finalDisabledOptions: Record<string, readonly string[]> = {};
    let finalVisible: Record<string, boolean> = {};

    for (let pass = 0; pass < maxPasses; pass += 1) {
        let hasChanged = false;
        const visibleMap: Record<string, boolean> = {};
        const disabledOptionsMap: Record<string, readonly string[]> = {};

        for (const field of allFields) {
            const isVisible =
                field.visibleWhen !== undefined
                    ? evaluateCondition(field.visibleWhen, currentAnswers)
                    : true;
            visibleMap[field.key] = isVisible;

            if (!isVisible && Object.hasOwn(currentAnswers, field.key)) {
                Reflect.deleteProperty(currentAnswers, field.key);
                hasChanged = true;
            }

            if (
                field.type === 'select' ||
                field.type === 'radio' ||
                field.type === 'checkbox_group' ||
                field.type === 'image_select'
            ) {
                const disabledList: string[] = [];
                for (const opt of field.options) {
                    if (
                        opt.disabledWhen !== undefined &&
                        evaluateCondition(opt.disabledWhen, currentAnswers)
                    ) {
                        disabledList.push(opt.value);
                    }
                }
                disabledOptionsMap[field.key] = disabledList;

                if (isVisible && Object.hasOwn(currentAnswers, field.key)) {
                    const val = currentAnswers[field.key];
                    const { isAnswerDropped, nextAnswer } =
                        filterDisabledOptions(field, val, disabledList);
                    if (isAnswerDropped) {
                        Reflect.deleteProperty(currentAnswers, field.key);
                        hasChanged = true;
                    } else if (!isStrictEqual(nextAnswer, val)) {
                        currentAnswers[field.key] = nextAnswer;
                        hasChanged = true;
                    }
                }
            } else {
                disabledOptionsMap[field.key] = [];
            }
        }

        finalVisible = visibleMap;
        finalDisabledOptions = disabledOptionsMap;

        if (!hasChanged) {
            break;
        }
    }

    const disabled: Record<string, boolean> = {};
    const missingRequired: string[] = [];

    for (const field of allFields) {
        const isVisible = finalVisible[field.key] ?? true;
        const isDisabled =
            field.disabledWhen !== undefined
                ? evaluateCondition(field.disabledWhen, currentAnswers)
                : false;
        disabled[field.key] = isDisabled;

        if (field.required && isVisible && !isDisabled) {
            const ans = Object.hasOwn(currentAnswers, field.key)
                ? currentAnswers[field.key]
                : null;
            if (isAnswerEmpty(field, ans)) {
                missingRequired.push(field.key);
            }
        }
    }

    return {
        visible: finalVisible,
        disabled,
        disabledOptions: finalDisabledOptions,
        answers: currentAnswers,
        missingRequired,
    };
}
