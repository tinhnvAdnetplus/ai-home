import fs from 'node:fs';
import { resolveWizardState } from '../packages/config-schema/src/wizard-state.js';

const inputRaw = fs.readFileSync(0, 'utf-8');
const input = JSON.parse(inputRaw);

const state = resolveWizardState(input.wizard, input.answers);
process.stdout.write(JSON.stringify(state));
