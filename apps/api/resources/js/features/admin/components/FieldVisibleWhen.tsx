import { useTranslation } from 'react-i18next';
import { Code2 } from 'lucide-react';
import type { Condition } from '@aihome/config-schema';

type FieldVisibleWhenProps = {
    readonly visibleWhen: Condition | undefined;
};

export function FieldVisibleWhen({
    visibleWhen,
}: FieldVisibleWhenProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('visibleWhen')}</span>
            </div>
            {visibleWhen ? (
                <pre className="p-3 bg-slate-900 text-slate-200 text-xs font-mono rounded-lg overflow-x-auto max-h-36">
                    {JSON.stringify(visibleWhen, null, 2)}
                </pre>
            ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {t('noCondition')}
                </p>
            )}
        </div>
    );
}
