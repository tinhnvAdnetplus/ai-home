import { type WizardState } from '@aihome/config-schema';
import {
    Step2CustomSections,
    STEP2_CUSTOM_SECTION_KEYS,
} from './sections/Step2CustomSections';
import { Step3PlanAreaSection } from './sections/Step3PlanAreaSection';
import { Step3PlanRoomsSection } from './sections/Step3PlanRoomsSection';
import { Step3PlanWaterSection } from './sections/Step3PlanWaterSection';
import { Step3PlanStorageSection } from './sections/Step3PlanStorageSection';
import { Step3PlanParkingSection } from './sections/Step3PlanParkingSection';

type CustomSectionRendererProps = {
    readonly sectionKey: string;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly errors?: Record<string, string> | undefined;
};

const STEP3_CUSTOM_SECTION_KEYS = new Set<string>([
    'plan_area_section',
    'plan_rooms_section',
    'plan_water_section',
    'plan_storage_section',
    'plan_parking_section',
]);

export function isCustomSection(sectionKey: string): boolean {
    return (
        STEP2_CUSTOM_SECTION_KEYS.has(sectionKey) ||
        STEP3_CUSTOM_SECTION_KEYS.has(sectionKey)
    );
}

export function CustomSectionRenderer({
    sectionKey,
    answers,
    resolvedState,
    onAnswerChange,
    errors = {},
}: CustomSectionRendererProps): React.JSX.Element | null {
    if (STEP2_CUSTOM_SECTION_KEYS.has(sectionKey)) {
        return (
            <Step2CustomSections
                sectionKey={sectionKey}
                answers={answers}
                resolvedState={resolvedState}
                onAnswerChange={onAnswerChange}
                errors={errors}
            />
        );
    }

    switch (sectionKey) {
        case 'plan_area_section':
            return (
                <Step3PlanAreaSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={
                        resolvedState.disabled.plan_target_area ?? false
                    }
                    errors={errors}
                />
            );
        case 'plan_rooms_section':
            return (
                <Step3PlanRoomsSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={false}
                    errors={errors}
                />
            );
        case 'plan_water_section':
            return (
                <Step3PlanWaterSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={false}
                    errors={errors}
                />
            );
        case 'plan_storage_section':
            return (
                <Step3PlanStorageSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={false}
                    errors={errors}
                />
            );
        case 'plan_parking_section':
            return (
                <Step3PlanParkingSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={false}
                    errors={errors}
                />
            );
        default:
            return null;
    }
}
