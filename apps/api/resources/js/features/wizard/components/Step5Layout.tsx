import { type Section, type WizardState } from '@aihome/config-schema';
import { Step5StyleSection } from './sections/Step5StyleSection';
import { Step5SelectedImagesPanel } from './Step5SelectedImagesPanel';
import { Step5ColorsSection } from './sections/Step5ColorsSection';
import { Step5MaterialsSection } from './sections/Step5MaterialsSection';
import { Step5FeaturesSection } from './sections/Step5FeaturesSection';
import { Step5PhotosSection } from './sections/Step5PhotosSection';
import { Step5NotesSection } from './sections/Step5NotesSection';

type Step5LayoutProps = {
    readonly sections: readonly Section[];
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly errors: Record<string, string>;
};

function toStringArray(
    val: unknown,
    fallback: readonly string[],
): readonly string[] {
    if (Array.isArray(val)) {
        return val.filter((x): x is string => typeof x === 'string');
    }
    return fallback;
}

function toStringValue(val: unknown, fallback: string): string {
    return typeof val === 'string' ? val : fallback;
}

export function Step5Layout({
    sections,
    answers,
    onAnswerChange,
}: Step5LayoutProps): React.JSX.Element {
    const findSec = (k: string, idx: number) =>
        sections.find((s) => s.key === k) ?? sections[idx];
    const sec1 = findSec('design_exterior_style_section', 0);
    const sec2 = findSec('design_interior_style_section', 1);
    const sec3 = findSec('design_exterior_colors_section', 2);
    const sec4 = findSec('design_interior_materials_section', 3);
    const sec5 = findSec('design_features_section', 4);
    const sec6 = findSec('design_photos_section', 5);
    const sec7 = findSec('design_notes_section', 6);

    const exteriorStyle = toStringArray(answers.design_exterior_style, [
        'modern',
    ]);
    const interiorStyle = toStringArray(answers.design_interior_style, [
        'natural',
    ]);
    const wallColor = toStringArray(answers.design_exterior_wall_color, [
        'white',
    ]);
    const roofColor = toStringArray(answers.design_roof_color, ['black']);
    const flooring = toStringValue(answers.design_flooring_material, 'natural');
    const wallInterior = toStringValue(answers.design_wall_color, 'bright');
    const features = toStringArray(answers.design_features, [
        'large_window',
        'wood_deck',
        'green_exterior',
    ]);
    const photos = toStringArray(answers.design_favorite_photos, [
        'photo_modern_exterior',
        'photo_wa_exterior',
    ]);
    const notes = toStringValue(answers.design_notes, '');

    return (
        <div className="flex flex-col gap-2 xl:gap-2.5 flex-1 min-h-0 my-1">
            <div className="flex flex-col lg:flex-row gap-2 xl:gap-2.5 items-stretch">
                <div className="flex-1 flex flex-col gap-2 xl:gap-2.5 min-w-0">
                    {sec1 ? (
                        <Step5StyleSection
                            section={sec1}
                            value={exteriorStyle}
                            onChange={onAnswerChange}
                        />
                    ) : null}
                    {sec2 ? (
                        <Step5StyleSection
                            section={sec2}
                            value={interiorStyle}
                            onChange={onAnswerChange}
                            isInterior
                        />
                    ) : null}
                </div>
                <div className="hidden lg:flex">
                    <Step5SelectedImagesPanel />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 xl:gap-2.5">
                {sec3 ? (
                    <Step5ColorsSection
                        section={sec3}
                        wallValue={wallColor}
                        roofValue={roofColor}
                        onChange={onAnswerChange}
                    />
                ) : null}
                {sec4 ? (
                    <Step5MaterialsSection
                        section={sec4}
                        floorValue={flooring}
                        wallValue={wallInterior}
                        onChange={onAnswerChange}
                    />
                ) : null}
                {sec5 ? (
                    <Step5FeaturesSection
                        section={sec5}
                        value={features}
                        onChange={onAnswerChange}
                    />
                ) : null}
                {sec6 ? (
                    <Step5PhotosSection
                        section={sec6}
                        value={photos}
                        onChange={onAnswerChange}
                    />
                ) : null}
                {sec7 ? (
                    <Step5NotesSection
                        section={sec7}
                        value={notes}
                        onChange={onAnswerChange}
                    />
                ) : null}
            </div>

            <div className="block lg:hidden mt-1 pb-12 lg:pb-0">
                <Step5SelectedImagesPanel />
            </div>
        </div>
    );
}
