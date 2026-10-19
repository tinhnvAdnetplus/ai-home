import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LocalizedText } from '@aihome/config-schema';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';

type FieldHelpEditorProps = {
    readonly help: LocalizedText | undefined;
    readonly onChange: (updated: LocalizedText | undefined) => void;
};

const LANG_OPTIONS: readonly ('ja' | 'en' | 'vi')[] = ['ja', 'en', 'vi'];

function getLangKey(
    lang: 'ja' | 'en' | 'vi',
): 'labelJa' | 'labelEn' | 'labelVi' {
    if (lang === 'ja') return 'labelJa';
    if (lang === 'en') return 'labelEn';
    return 'labelVi';
}

export function FieldHelpEditor({
    help,
    onChange,
}: FieldHelpEditorProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [helpTab, setHelpTab] = useState<'ja' | 'en' | 'vi'>('ja');

    const currentHelp = help ?? { ja: '' };

    const handleTextChange = (lang: 'ja' | 'en' | 'vi', value: string) => {
        const merged = { ...currentHelp, [lang]: value };
        const jaTrim = merged.ja.trim();
        const enTrim = merged.en?.trim();
        const viTrim = merged.vi?.trim();

        if (!jaTrim && !enTrim && !viTrim) {
            onChange(undefined);
            return;
        }

        const cleaned: LocalizedText = {
            ja: merged.ja,
            ...(enTrim ? { en: merged.en } : {}),
            ...(viTrim ? { vi: merged.vi } : {}),
        };
        onChange(cleaned);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('helpText')}
                </Label>
                <div className="flex bg-slate-100 p-0.5 rounded-md text-xs">
                    {LANG_OPTIONS.map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => {
                                setHelpTab(lang);
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                helpTab === lang
                                    ? 'bg-white text-blue-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {t(getLangKey(lang))}
                        </button>
                    ))}
                </div>
            </div>
            <Input
                value={currentHelp[helpTab] ?? ''}
                onChange={(e) => {
                    handleTextChange(helpTab, e.target.value);
                }}
                placeholder={t('helpText')}
                className="text-sm bg-white"
            />
        </div>
    );
}
