import { useTranslation } from 'react-i18next';
import { type Section } from '@aihome/config-schema';
import { resolveLocalized } from '../../lib/field-helpers';

type Step5NotesSectionProps = {
    readonly section: Section;
    readonly value: string;
    readonly onChange: (key: string, value: string) => void;
};

export function Step5NotesSection({
    section,
    value,
    onChange,
}: Step5NotesSectionProps): React.JSX.Element {
    const { i18n } = useTranslation();
    const field = section.fields[0];
    const placeholder =
        field && 'placeholder' in field && field.placeholder
            ? resolveLocalized(field.placeholder, i18n.language)
            : '';
    const maxLength =
        field && 'maxLength' in field && field.maxLength
            ? field.maxLength
            : 300;

    return (
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3 xl:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] xl:col-span-4">
            <header className="flex items-center gap-2 mb-1.5">
                <h2 className="text-xs xl:text-[14px] font-bold text-slate-900 tracking-tight leading-tight break-words">
                    {resolveLocalized(section.title, i18n.language)}
                </h2>
            </header>

            <div className="flex flex-col flex-1 justify-between gap-1">
                <textarea
                    rows={3}
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(e) => {
                        if (field) onChange(field.key, e.target.value);
                    }}
                    className="w-full resize-none rounded-lg border border-slate-200 p-2 text-[16px] sm:text-xs xl:text-[10.5px] leading-relaxed text-slate-700 placeholder:text-slate-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[58px] flex-1"
                />
                <div className="text-right text-xs sm:text-[9.5px] text-slate-400 font-medium">
                    {value.length}/{maxLength}
                </div>
            </div>
        </section>
    );
}
