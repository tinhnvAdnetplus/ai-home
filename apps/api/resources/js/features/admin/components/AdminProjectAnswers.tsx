import { useTranslation } from 'react-i18next';
import type { LocalizedText } from '@aihome/config-schema';
import { validatedDefaultWizard } from '@/features/wizard';
import type { AdminProjectItem } from '../types/admin-types';

const FIELD_LABELS = new Map<string, LocalizedText>();
for (const step of validatedDefaultWizard.steps) {
    for (const section of step.sections) {
        for (const field of section.fields) {
            FIELD_LABELS.set(field.key, field.label);
        }
    }
}

function resolveLabel(key: string, lang: string): string {
    const loc = FIELD_LABELS.get(key);
    if (!loc) return key;
    if (lang === 'en' && loc.en) return loc.en;
    if (lang === 'vi' && loc.vi) return loc.vi;
    return loc.ja;
}

type Props = { readonly answers: AdminProjectItem['answers'] };

export function AdminProjectAnswers({ answers }: Props): React.JSX.Element {
    const { i18n } = useTranslation();

    return (
        <>
            {Object.entries(answers).map(([key, val]) => {
                const label = resolveLabel(key, i18n.language);
                const displayVal = Array.isArray(val)
                    ? val.join(', ')
                    : typeof val === 'object' && val !== null
                      ? JSON.stringify(val)
                      : String(val);
                return (
                    <div key={key} className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500">
                            {label}:
                        </span>
                        <div className="text-slate-800 font-medium break-words">
                            {displayVal}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
