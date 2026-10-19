import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Clock, Cpu } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import type { TestPromptResponse } from '../types/admin-types';

type AiPromptTestResultProps = {
    readonly result: TestPromptResponse;
};

export function AiPromptTestResult({
    result,
}: AiPromptTestResultProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                    {result.isValid ? (
                        <Badge
                            variant="success"
                            className="flex items-center gap-1"
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('schemaValid')}</span>
                        </Badge>
                    ) : (
                        <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                        >
                            <XCircle className="w-3 h-3" />
                            <span>{t('schemaInvalid')}</span>
                        </Badge>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                        <Cpu className="w-3 h-3" />
                        {result.source}
                    </span>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('msUnit', { ms: result.latencyMs })}
                    </span>
                    <span>
                        {t('tokensUsage', {
                            in: result.usage.inputTokens,
                            out: result.usage.outputTokens,
                        })}
                    </span>
                </div>
            </div>

            {result.issues.length > 0 && (
                <div className="p-2.5 bg-red-950/60 border border-red-900/50 rounded-lg text-red-200 text-xs space-y-1">
                    {result.issues.map((iss) => (
                        <div key={iss}>• {iss}</div>
                    ))}
                </div>
            )}

            <pre className="text-[11px] font-mono overflow-x-auto p-3 bg-black/40 rounded-lg text-emerald-400 max-h-60 leading-relaxed">
                {JSON.stringify(result.output, null, 2)}
            </pre>
        </div>
    );
}
