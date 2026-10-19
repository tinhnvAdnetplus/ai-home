import { type WizardConfig } from '../wizard/wizard-schema.js';
import { sampleStep1, sampleStep2 } from './sample-steps.js';

export const sampleWizard: WizardConfig = {
    schemaVersion: 1,
    steps: [sampleStep1, sampleStep2],
};
