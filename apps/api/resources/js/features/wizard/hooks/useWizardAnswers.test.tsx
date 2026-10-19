import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { defaultWizard } from '../data/default-wizard';
import { computeWizardHash, saveStoredDraft } from '../lib/wizard-storage';
import { useWizardAnswers } from './useWizardAnswers';

describe('useWizardAnswers with the dev step parameter', () => {
    afterEach(() => {
        window.localStorage.clear();
        window.location.hash = '';
    });

    it('opens the requested step without wiping the saved draft', () => {
        const hash = computeWizardHash(defaultWizard);
        saveStoredDraft(hash, { land_area: 60, frontage: 15, depth: 4 }, 1);
        window.location.hash = '#/wizard?step=5';

        const { result } = renderHook(() => useWizardAnswers(defaultWizard));

        expect(result.current.currentStepIndex).toBe(4);
        expect(result.current.answers.land_area).toBe(60);
        expect(result.current.answers.frontage).toBe(15);
        expect(result.current.answers.depth).toBe(4);
    });
});
