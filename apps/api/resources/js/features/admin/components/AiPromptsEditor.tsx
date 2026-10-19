import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquareText, HelpCircle, Code } from 'lucide-react';
import { Textarea } from '@/shared/ui/Textarea';
import { Label } from '@/shared/ui/Label';
import type { AiConfigPayload } from '../types/admin-types';

type AiPromptsEditorProps = {
    readonly config: AiConfigPayload;
    readonly onChange: (
        updater: (prev: AiConfigPayload) => AiConfigPayload,
    ) => void;
};

type LangKey = 'ja' | 'en' | 'vi';
const SUPPORTED_LANGS: readonly LangKey[] = ['ja', 'en', 'vi'];

export function AiPromptsEditor({
    config,
    onChange,
}: AiPromptsEditorProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [selectedLang, setSelectedLang] = useState<LangKey>('ja');

    const handleUpdatePrompt = (
        which: 'constraints' | 'commentary',
        val: string,
    ) => {
        onChange((prev) => ({
            ...prev,
            prompts: {
                ...prev.prompts,
                [which]: { ...prev.prompts[which], [selectedLang]: val },
            },
        }));
    };

    const getLangLabel = (lang: LangKey) => {
        if (lang === 'ja') return t('langJa');
        if (lang === 'en') return t('langEn');
        return t('langVi');
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-800">
                        {t('aiPromptsTitle')}
                    </h2>
                </div>
                <div className="flex items-center rounded-lg bg-slate-100 p-1">
                    {SUPPORTED_LANGS.map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => {
                                setSelectedLang(lang);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                selectedLang === lang
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {getLangLabel(lang)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-800 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-semibold">{t('placeholderHelpTitle')}</p>
                    <p className="text-slate-600">{t('placeholderHelpDesc')}</p>
                    <div className="flex items-center gap-2 pt-1">
                        <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-[11px] text-blue-900">
                            {t('placeholderAnswersTag')}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                            {t('placeholderAnswersHelp')}
                        </span>
                        <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-[11px] text-blue-900">
                            {t('placeholderLocaleTag')}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                            {t('placeholderLocaleHelp')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="prompt-constraints"
                            className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                        >
                            <Code className="w-3.5 h-3.5 text-slate-500" />
                            {t('promptConstraintsLabel')}
                        </Label>
                        <span className="text-[11px] text-slate-400 font-mono">
                            {getLangLabel(selectedLang)}
                        </span>
                    </div>
                    <Textarea
                        id="prompt-constraints"
                        rows={6}
                        value={config.prompts.constraints[selectedLang] ?? ''}
                        onChange={(e) => {
                            handleUpdatePrompt('constraints', e.target.value);
                        }}
                        className="text-xs font-mono leading-relaxed"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="prompt-commentary"
                            className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                        >
                            <Code className="w-3.5 h-3.5 text-slate-500" />
                            {t('promptCommentaryLabel')}
                        </Label>
                        <span className="text-[11px] text-slate-400 font-mono">
                            {getLangLabel(selectedLang)}
                        </span>
                    </div>
                    <Textarea
                        id="prompt-commentary"
                        rows={6}
                        value={config.prompts.commentary[selectedLang] ?? ''}
                        onChange={(e) => {
                            handleUpdatePrompt('commentary', e.target.value);
                        }}
                        className="text-xs font-mono leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
}
