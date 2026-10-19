import { describe, expect, it } from 'vitest';
import { parseWizardConfig } from '@aihome/config-schema';
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
});
