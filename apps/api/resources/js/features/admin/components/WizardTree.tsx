import { useTranslation } from 'react-i18next';
import { Layers, Folder, FileText } from 'lucide-react';
import type { WizardConfig } from '@aihome/config-schema';
import { Badge } from '@/shared/ui/Badge';

type WizardTreeProps = {
    readonly wizard: WizardConfig | null;
    readonly selectedStepIndex: number;
    readonly selectedSectionIndex: number;
    readonly selectedFieldKey: string | null;
    readonly onSelectField: (
        stepIdx: number,
        secIdx: number,
        fieldKey: string,
    ) => void;
};

function getLangKey(lang: string): 'ja' | 'en' | 'vi' {
    if (lang.startsWith('en')) {
        return 'en';
    }
    if (lang.startsWith('vi')) {
        return 'vi';
    }
    return 'ja';
}

export function WizardTree({
    wizard,
    selectedStepIndex,
    selectedSectionIndex,
    selectedFieldKey,
    onSelectField,
}: WizardTreeProps): React.JSX.Element {
    const { t, i18n } = useTranslation('admin');
    const currentLang = getLangKey(i18n.language);

    if (!wizard) {
        return (
            <div className="p-4 text-xs text-slate-400 text-center">
                {t('noData')}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('treeTitle')}
                </span>
            </div>

            <div className="p-2 overflow-y-auto space-y-3 flex-1 max-h-[calc(100vh-280px)]">
                {wizard.steps.map((step, sIdx) => {
                    const stepTitle = step.title[currentLang] ?? step.title.ja;

                    return (
                        <div key={step.key} className="space-y-1">
                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-800 bg-slate-100/80 rounded-md">
                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                                    {(sIdx + 1).toString()}
                                </span>
                                <span className="truncate">{stepTitle}</span>
                            </div>

                            <div className="pl-3 space-y-1.5 border-l-2 border-slate-100 ml-2.5">
                                {step.sections.map((section, secIdx) => {
                                    const secTitle =
                                        section.title[currentLang] ??
                                        section.title.ja;

                                    return (
                                        <div
                                            key={section.key}
                                            className="space-y-1"
                                        >
                                            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                                <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="truncate">
                                                    {secTitle}
                                                </span>
                                            </div>

                                            <div className="pl-2 space-y-0.5">
                                                {section.fields.map((field) => {
                                                    const isSelected =
                                                        sIdx ===
                                                            selectedStepIndex &&
                                                        secIdx ===
                                                            selectedSectionIndex &&
                                                        field.key ===
                                                            selectedFieldKey;

                                                    const fieldLabel =
                                                        field.label[
                                                            currentLang
                                                        ] ?? field.label.ja;

                                                    return (
                                                        <button
                                                            key={field.key}
                                                            type="button"
                                                            onClick={() => {
                                                                onSelectField(
                                                                    sIdx,
                                                                    secIdx,
                                                                    field.key,
                                                                );
                                                            }}
                                                            className={`w-full text-left flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
                                                                isSelected
                                                                    ? 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-300'
                                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <span className="truncate">
                                                                    {fieldLabel}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] py-0 px-1 border-slate-200 shrink-0 uppercase"
                                                            >
                                                                {field.type}
                                                            </Badge>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
