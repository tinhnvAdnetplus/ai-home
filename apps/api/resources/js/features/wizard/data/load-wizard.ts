import { parseWizardConfig, type WizardConfig } from '@aihome/config-schema';
import { defaultWizard } from './default-wizard';

function loadValidatedWizard(): WizardConfig {
    const result = parseWizardConfig(defaultWizard);
    if (!result.ok) {
        const issuesSummary = result.issues
            .map(
                (issue) =>
                    `${issue.path.join('.')}: [${issue.code}] ${issue.message}`,
            )
            .join('\n');
        throw new Error(
            `Default wizard configuration validation failed:\n${issuesSummary}`,
        );
    }
    return result.data;
}

export const validatedDefaultWizard: WizardConfig = loadValidatedWizard();
