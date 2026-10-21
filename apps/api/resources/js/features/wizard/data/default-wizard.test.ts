import { describe, expect, it } from 'vitest';
import { parseWizardConfig, resolveWizardState } from '@aihome/config-schema';
import { defaultWizard } from './default-wizard';

describe('default wizard configuration', () => {
    it('is accepted by the shared validator (lists every issue when it is not)', () => {
        const result = parseWizardConfig(defaultWizard);
        const report = result.ok
            ? ''
            : result.issues
                  .map(
                      (issue) =>
                          `${issue.code} ${issue.path.join('.')} ${issue.message}`,
                  )
                  .join('\n');
        expect(report).toBe('');
        expect(result.ok).toBe(true);
    });

    it('enforces study / remote work constraints when plan_study_count is count_0', () => {
        const state = resolveWizardState(defaultWizard, {
            plan_study_count: 'count_0',
            life_work: 'dedicated_room',
            life_spaces: ['workspace', 'deck_garden'],
        });

        // Field life_work is disabled
        expect(state.disabled['life_work']).toBe(true);
        // Option workspace in life_spaces is disabled
        expect(state.disabledOptions['life_spaces']).toContain('workspace');
        // Option dedicated_room in life_work is disabled
        expect(state.disabledOptions['life_work']).toContain('dedicated_room');

        // Conflicting answers are filtered out cleanly
        expect(state.answers['life_spaces']).not.toContain('workspace');
        expect(state.answers['life_spaces']).toContain('deck_garden');
        expect(state.answers['life_work']).toBeUndefined();
    });

    it('enforces tatami space constraint when plan_tatami_count is count_0', () => {
        const state = resolveWizardState(defaultWizard, {
            plan_tatami_count: 'count_0',
            life_spaces: ['tatami', 'deck_garden'],
        });

        expect(state.disabledOptions['life_spaces']).toContain('tatami');
        expect(state.answers['life_spaces']).not.toContain('tatami');
        expect(state.answers['life_spaces']).toContain('deck_garden');
    });

    it('enforces parking constraints when plan_parking_count is none', () => {
        const state = resolveWizardState(defaultWizard, {
            plan_parking_count: 'none',
            life_parking: ['cars_2', 'bicycle_space'],
            design_features: ['garage', 'wood_deck'],
        });

        expect(state.disabledOptions['life_parking']).toEqual(
            expect.arrayContaining(['cars_1', 'cars_2', 'cars_3_plus']),
        );
        expect(state.disabledOptions['design_features']).toContain('garage');

        expect(state.answers['life_parking']).toEqual(['bicycle_space']);
        expect(state.answers['design_features']).not.toContain('garage');
        expect(state.answers['design_features']).toContain('wood_deck');
    });

    it('enforces one-story constraints for toilets, storage under stairs, and fukinuke', () => {
        const state = resolveWizardState(defaultWizard, {
            floors: 'one_story',
            plan_type: 'one_story',
            plan_storage: ['under_stairs', 'pantry'],
            plan_toilet: 'two_floors',
            life_spaces: ['fukinuke', 'deck_garden'],
            design_features: ['fukinuke', 'wood_deck'],
        });

        expect(state.disabledOptions['plan_storage']).toContain('under_stairs');
        expect(state.disabledOptions['plan_toilet']).toContain('two_floors');
        expect(state.disabledOptions['plan_toilet']).toContain('three_or_more');
        expect(state.disabledOptions['life_spaces']).toContain('fukinuke');
        expect(state.disabledOptions['design_features']).toContain('fukinuke');

        expect(state.answers['plan_storage']).not.toContain('under_stairs');
        expect(state.answers['plan_storage']).toContain('pantry');
        expect(state.answers['plan_toilet']).toBeUndefined();
        expect(state.answers['life_spaces']).not.toContain('fukinuke');
        expect(state.answers['design_features']).not.toContain('fukinuke');
    });
});
