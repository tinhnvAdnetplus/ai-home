import { type WizardState } from '@aihome/config-schema';
import { Step2LandLocationSection } from './Step2LandLocationSection';
import { Step2LandAreaSection } from './Step2LandAreaSection';
import { Step2FrontageDepthSection } from './Step2FrontageDepthSection';
import { Step2RoadWidthSection } from './Step2RoadWidthSection';
import { Step2SurroundingsSection } from './Step2SurroundingsSection';
import { Step2DrawingsPhotosSection } from './Step2DrawingsPhotosSection';

type Props = {
    readonly sectionKey: string;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly errors?: Record<string, string> | undefined;
};

export const STEP2_CUSTOM_SECTION_KEYS = new Set<string>([
    'land_location_section',
    'land_area_section',
    'frontage_depth_section',
    'road_width_section',
    'surroundings_section',
    'drawings_photos_section',
]);

export function Step2CustomSections({
    sectionKey,
    answers,
    resolvedState,
    onAnswerChange,
    errors = {},
}: Props): React.JSX.Element | null {
    switch (sectionKey) {
        case 'land_location_section':
            return (
                <Step2LandLocationSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={resolvedState.disabled.land_location ?? false}
                    errors={errors}
                />
            );
        case 'land_area_section':
            return (
                <Step2LandAreaSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={resolvedState.disabled.land_area ?? false}
                    errors={errors}
                />
            );
        case 'frontage_depth_section':
            return (
                <Step2FrontageDepthSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={resolvedState.disabled.frontage ?? false}
                    errors={errors}
                />
            );
        case 'road_width_section':
            return (
                <Step2RoadWidthSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={resolvedState.disabled.road_width ?? false}
                    errors={errors}
                />
            );
        case 'surroundings_section':
            return (
                <Step2SurroundingsSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={resolvedState.disabled.surroundings ?? false}
                    errors={errors}
                />
            );
        case 'drawings_photos_section':
            return (
                <Step2DrawingsPhotosSection
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    isDisabled={
                        resolvedState.disabled.land_survey_file ?? false
                    }
                    errors={errors}
                />
            );
        default:
            return null;
    }
}
