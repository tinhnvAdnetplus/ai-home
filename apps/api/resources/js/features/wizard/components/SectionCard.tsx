import { useTranslation } from 'react-i18next';
import { type Section, type WizardState } from '@aihome/config-schema';
import { cn } from '@/shared/lib/cn';
import { FieldHeaderModeProvider } from '../lib/field-header-mode';
import { resolveLocalized } from '../lib/field-helpers';
import {
    getSectionColSpan,
    spanClass,
    HIDE_OPTIONAL_BADGE_SECTIONS,
} from '../lib/section-layout';
import {
    SectionIllustration,
    hasSectionIllustration,
} from '../lib/section-illustrations';
import { FieldRenderer } from './fields/FieldRenderer';
import {
    CustomSectionRenderer,
    isCustomSection,
} from './CustomSectionRenderer';

type SectionCardProps = {
    readonly section: Section;
    readonly answers: Record<string, unknown>;
    readonly resolvedState: WizardState;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly errors?: Record<string, string> | undefined;
};

export function SectionCard({
    section,
    answers,
    resolvedState,
    onAnswerChange,
    errors = {},
}: SectionCardProps): React.JSX.Element | null {
    const { t, i18n } = useTranslation();
    const fields = section.fields.filter(
        (f) => resolvedState.visible[f.key] ?? true,
    );

    if (fields.length === 0) {
        return null;
    }

    const isRequired = fields.some((f) => f.required);
    const hasSeveralFields = fields.length > 1;
    const isSwatchSection = fields.every(
        (f) =>
            f.type === 'image_select' &&
            f.options.every((o) => /^(color|floor)-/.test(o.image.mediaId)),
    );
    const colSpan = getSectionColSpan(section.key) ?? spanClass(fields);
    const hasIllustration = hasSectionIllustration(section.key);
    const isStep4 = section.key.startsWith('life_');
    const canShowOptional =
        !isRequired &&
        !isStep4 &&
        !HIDE_OPTIONAL_BADGE_SECTIONS.has(section.key);

    return (
        <section
            className={cn(
                'flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] h-full',
                isStep4 ? 'p-2.5 xl:px-4 xl:py-3' : 'p-3 xl:px-5 xl:py-3.5',
                colSpan,
            )}
        >
            <header className="flex items-center gap-2 mb-2 xl:mb-2 flex-wrap">
                <h2
                    className={cn(
                        'font-bold text-[#0c243c] leading-tight',
                        isStep4
                            ? 'text-sm xl:text-[14px]'
                            : 'text-sm xl:text-[18px]',
                    )}
                >
                    {resolveLocalized(section.title, i18n.language)}
                </h2>
                {isRequired ? (
                    <span className="inline-flex items-center rounded bg-[#fee2e2] px-1.5 py-0.5 text-xs xl:text-[12px] font-bold text-[#ef4444] leading-none">
                        {t('wizard:required')}
                    </span>
                ) : canShowOptional ? (
                    <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs xl:text-[12px] font-medium text-slate-500 leading-none">
                        {t('wizard:optional')}
                    </span>
                ) : null}
                {section.description ? (
                    <span className="text-xs text-slate-400 font-normal leading-tight ml-1">
                        {resolveLocalized(section.description, i18n.language)}
                    </span>
                ) : null}
            </header>

            {isCustomSection(section.key) ? (
                <CustomSectionRenderer
                    sectionKey={section.key}
                    answers={answers}
                    resolvedState={resolvedState}
                    onAnswerChange={onAnswerChange}
                    errors={errors}
                />
            ) : (
                <FieldHeaderModeProvider
                    value={hasSeveralFields ? 'sub' : 'hidden'}
                >
                    <div
                        className={cn(
                            hasIllustration &&
                                'flex flex-col sm:flex-row gap-3 items-center',
                            'flex-1 flex flex-col justify-between',
                        )}
                    >
                        <SectionIllustration sectionKey={section.key} />
                        <div
                            className={cn(
                                'flex-1 w-full flex flex-col justify-between',
                                hasSeveralFields
                                    ? isSwatchSection
                                        ? 'grid grid-cols-1 gap-2'
                                        : 'grid grid-cols-1 gap-3 sm:grid-cols-2'
                                    : 'flex flex-col gap-2 flex-1 justify-between',
                            )}
                        >
                            {fields.map((field) => (
                                <FieldRenderer
                                    key={field.key}
                                    field={field}
                                    value={answers[field.key]}
                                    onChange={onAnswerChange}
                                    isVisible
                                    isDisabled={
                                        resolvedState.disabled[field.key] ??
                                        false
                                    }
                                    disabledOptions={
                                        resolvedState.disabledOptions[
                                            field.key
                                        ] ?? []
                                    }
                                    error={errors[field.key]}
                                />
                            ))}
                        </div>
                    </div>
                </FieldHeaderModeProvider>
            )}
        </section>
    );
}
