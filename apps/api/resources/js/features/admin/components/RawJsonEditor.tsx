import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlignLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';

type RawJsonEditorProps = {
    readonly rawJson: string;
    readonly onApply: (newJson: string) => boolean;
};

export function RawJsonEditor({
    rawJson,
    onApply,
}: RawJsonEditorProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [text, setText] = useState(rawJson);
    const [syntaxError, setSyntaxError] = useState<string | null>(null);
    const [isApplied, setIsApplied] = useState(false);

    const handleFormat = () => {
        try {
            const parsed: unknown = JSON.parse(text);
            const formatted = JSON.stringify(parsed, null, 2);
            setText(formatted);
            setSyntaxError(null);
        } catch (err) {
            setSyntaxError(
                err instanceof Error ? err.message : t('rawJsonInvalid'),
            );
        }
    };

    const handleApply = () => {
        try {
            JSON.parse(text);
            setSyntaxError(null);
            const isSuccess = onApply(text);
            if (isSuccess) {
                setIsApplied(true);
                setTimeout(() => {
                    setIsApplied(false);
                }, 2000);
            }
        } catch (err) {
            setSyntaxError(
                err instanceof Error ? err.message : t('rawJsonInvalid'),
            );
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        {t('tabRawJson')}
                    </h2>
                    <p className="text-xs text-slate-500">{t('rawJsonHelp')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleFormat}>
                        <AlignLeft className="w-3.5 h-3.5 mr-1" />
                        {t('formatJson')}
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApply}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {isApplied ? t('saved') : t('applyRawJson')}
                    </Button>
                </div>
            </div>

            {syntaxError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{syntaxError}</span>
                </div>
            )}

            <Textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setSyntaxError(null);
                }}
                className="font-mono text-xs h-[520px] bg-slate-900 text-slate-100 rounded-lg p-4 leading-relaxed"
                spellCheck={false}
            />
        </div>
    );
}
