import { type WizardConfig } from '@aihome/config-schema';
import { step1Basic } from './steps/step1-basic';
import { step2Land } from './steps/step2-land';
import { step3Floorplan } from './steps/step3-floorplan';
import { step4Lifestyle } from './steps/step4-lifestyle';
import { step5Design } from './steps/step5-design';

export const defaultWizard: WizardConfig = {
    schemaVersion: 1,
    steps: [step1Basic, step2Land, step3Floorplan, step4Lifestyle, step5Design],
};
