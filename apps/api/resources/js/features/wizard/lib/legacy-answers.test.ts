import { describe, it, expect } from 'vitest';
import { validatedDefaultWizard } from '../data/load-wizard';
import { normalizeLegacyAnswers } from './legacy-answers';

const wizard = validatedDefaultWizard;

describe('normalizeLegacyAnswers', () => {
    it('rewrites {name, size} upload items to media references', () => {
        const result = normalizeLegacyAnswers(wizard, {
            land_area: 40,
            land_survey_file: [
                { name: 'survey.pdf', size: 12345 },
                { name: 'site.jpg', size: 6789 },
            ],
        });

        expect(result.land_survey_file).toEqual(['survey.pdf', 'site.jpg']);
        expect(result.land_area).toBe(40);
    });

    it('drops upload items that carry no file name', () => {
        const result = normalizeLegacyAnswers(wizard, {
            land_survey_file: ['survey.pdf', { size: 1 }, null, 7],
        });

        expect(result.land_survey_file).toEqual(['survey.pdf']);
    });

    it('returns the same object when every upload answer is already valid', () => {
        const answers = { land_survey_file: ['survey.pdf'], land_area: 40 };

        expect(normalizeLegacyAnswers(wizard, answers)).toBe(answers);
    });

    it('leaves answers without an upload value untouched', () => {
        const answers = { land_area: 40 };

        expect(normalizeLegacyAnswers(wizard, answers)).toBe(answers);
    });
});
