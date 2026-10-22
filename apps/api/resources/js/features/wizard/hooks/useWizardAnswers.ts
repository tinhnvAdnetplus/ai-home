import { useEffect, useMemo, useReducer } from 'react';
import {
    resolveWizardState,
    type WizardConfig,
    type WizardState,
} from '@aihome/config-schema';
import {
    computeWizardHash,
    loadStoredDraft,
    saveStoredDraft,
} from '../lib/wizard-storage';
import { extractDefaults } from '../lib/default-answers';
import { normalizeLegacyAnswers } from '../lib/legacy-answers';

type State = {
    readonly currentStepIndex: number;
    readonly answers: Record<string, unknown>;
};

type Action =
    | {
          readonly type: 'SET_ANSWER';
          readonly key: string;
          readonly value: unknown;
      }
    | { readonly type: 'CLEAR_ANSWER'; readonly key: string }
    | { readonly type: 'GO_TO_STEP'; readonly stepIndex: number }
    | {
          readonly type: 'RESET';
          readonly defaultAnswers: Record<string, unknown>;
      };

/**
 * Dev only: `#/wizard?step=3` opens step 3 (used by the screenshot script, which starts from an
 * empty profile and so gets the default answers). A saved draft is kept: starting from the
 * defaults here used to overwrite it, wiping fields that have no default (land area, frontage).
 */
function readDevStep(stepCount: number): number | null {
    if (!import.meta.env.DEV) return null;
    const match = /[?&]step=(\d+)/.exec(window.location.hash);
    const step = match?.[1] === undefined ? NaN : Number(match[1]) - 1;
    return Number.isInteger(step) && step >= 0 && step < stepCount
        ? step
        : null;
}

function initWizardState(wizard: WizardConfig, configHash: string): State {
    const defaults = extractDefaults(wizard);
    const devStep = readDevStep(wizard.steps.length);
    const draft = loadStoredDraft(configHash);
    const draftAnswers =
        draft === null ? null : normalizeLegacyAnswers(wizard, draft.answers);
    if (devStep !== null) {
        return {
            currentStepIndex: devStep,
            answers: { ...defaults, ...(draftAnswers ?? {}) },
        };
    }
    if (draft !== null && draftAnswers !== null) {
        return {
            currentStepIndex: Math.min(
                Math.max(0, draft.stepIndex),
                wizard.steps.length - 1,
            ),
            answers: { ...defaults, ...draftAnswers },
        };
    }
    return { currentStepIndex: 0, answers: defaults };
}

function wizardReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_ANSWER':
            return {
                ...state,
                answers: { ...state.answers, [action.key]: action.value },
            };
        case 'CLEAR_ANSWER': {
            const next = { ...state.answers };
            Reflect.deleteProperty(next, action.key);
            return { ...state, answers: next };
        }
        case 'GO_TO_STEP':
            return { ...state, currentStepIndex: action.stepIndex };
        case 'RESET':
            return { currentStepIndex: 0, answers: action.defaultAnswers };
    }
}

export type UseWizardAnswersResult = {
    readonly currentStepIndex: number;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly setAnswer: (key: string, value: unknown) => void;
    readonly clearAnswer: (key: string) => void;
    readonly goToStep: (stepIndex: number) => void;
    readonly nextStep: () => void;
    readonly prevStep: () => void;
    readonly resetAnswers: () => void;
};

export function useWizardAnswers(wizard: WizardConfig): UseWizardAnswersResult {
    const configHash = useMemo(() => computeWizardHash(wizard), [wizard]);

    const [state, dispatch] = useReducer(wizardReducer, undefined, () =>
        initWizardState(wizard, configHash),
    );

    useEffect(() => {
        saveStoredDraft(configHash, state.answers, state.currentStepIndex);
    }, [configHash, state.answers, state.currentStepIndex]);

    const resolvedState = useMemo(
        () => resolveWizardState(wizard, state.answers),
        [wizard, state.answers],
    );

    const setAnswer = (key: string, value: unknown): void => {
        dispatch({ type: 'SET_ANSWER', key, value });
    };

    const clearAnswer = (key: string): void => {
        dispatch({ type: 'CLEAR_ANSWER', key });
    };

    const goToStep = (stepIndex: number): void => {
        const safeIdx = Math.min(Math.max(0, stepIndex), wizard.steps.length);
        dispatch({ type: 'GO_TO_STEP', stepIndex: safeIdx });
    };

    const nextStep = (): void => {
        goToStep(state.currentStepIndex + 1);
    };

    const prevStep = (): void => {
        goToStep(state.currentStepIndex - 1);
    };

    const resetAnswers = (): void => {
        const defaultAnswers = extractDefaults(wizard);
        dispatch({ type: 'RESET', defaultAnswers });
    };

    return {
        currentStepIndex: state.currentStepIndex,
        answers: resolvedState.answers,
        resolvedState,
        setAnswer,
        clearAnswer,
        goToStep,
        nextStep,
        prevStep,
        resetAnswers,
    };
}
