import { describe, expect, it } from 'vitest';
import { parseWizardConfig, sampleWizard } from '@aihome/config-schema';

describe('config-schema workspace resolution smoke test', () => {
    it('successfully imports and calls parseWizardConfig from @aihome/config-schema', () => {
        const res = parseWizardConfig(sampleWizard);
        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.data.schemaVersion).toBe(1);
            expect(res.data.steps.length).toBeGreaterThan(0);
        }
    });
});
