import { useTranslation } from 'react-i18next';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Issue } from '@aihome/config-schema';
import { Badge } from '@/shared/ui/Badge';

type ValidationPanelProps = {
    readonly issues: readonly Issue[];
};

export function ValidationPanel({
    issues,
}: ValidationPanelProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    if (issues.length === 0) {
        return (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                        {t('validationValid')}
                    </span>
                </div>
                <span className="text-[11px] text-emerald-700/80 font-mono hidden sm:inline">
                    {t('validationOkDetail')}
                </span>
            </div>
        );
    }

    return (
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                    {t('issuesListTitle')}
                    <span className="ml-1 text-slate-500 font-normal">
                        ({issues.length.toString()})
                    </span>
                </h3>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {issues.map((issue, idx) => {
                    const pathStr =
                        issue.path.length > 0
                            ? issue.path.join('.')
                            : t('rootPath', '(root)');
                    return (
                        <div
                            key={`${issue.code}-${pathStr}-${idx.toString()}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 bg-white border border-rose-100 rounded-lg text-xs"
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span className="font-mono text-slate-700 font-medium">
                                    {pathStr}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600">
                                    {issue.message}
                                </span>
                                <Badge
                                    variant="destructive"
                                    className="text-[10px] py-0 px-1 font-mono"
                                >
                                    {issue.code}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
