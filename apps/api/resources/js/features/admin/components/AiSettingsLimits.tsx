import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import type { AiConfigPayload } from '../types/admin-types';

type AiSettingsLimitsProps = {
    readonly config: AiConfigPayload;
    readonly onChange: (
        updater: (prev: AiConfigPayload) => AiConfigPayload,
    ) => void;
};

export function AiSettingsLimits({
    config,
    onChange,
}: AiSettingsLimitsProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
                <Label
                    htmlFor="ai-max-tokens"
                    className="text-xs font-semibold text-slate-700"
                >
                    {t('aiMaxTokens')} {t('aiMaxTokensHelp')}
                </Label>
                <Input
                    id="ai-max-tokens"
                    type="number"
                    min="256"
                    max="4096"
                    value={config.maxTokens}
                    onChange={(e) => {
                        const newTokens = parseInt(e.target.value, 10) || 2048;
                        onChange((prev) => ({ ...prev, maxTokens: newTokens }));
                    }}
                    className="text-xs font-mono"
                />
            </div>

            <div className="space-y-1.5">
                <Label
                    htmlFor="ai-daily-limit"
                    className="text-xs font-semibold text-slate-700"
                >
                    {t('aiDailyLimit')} {t('aiDailyLimitHelp')}
                </Label>
                <Input
                    id="ai-daily-limit"
                    type="number"
                    min="1"
                    max="10000"
                    value={config.dailyLimit}
                    onChange={(e) => {
                        const newLimit = parseInt(e.target.value, 10) || 50;
                        onChange((prev) => ({ ...prev, dailyLimit: newLimit }));
                    }}
                    className="text-xs font-mono"
                />
            </div>

            <div className="space-y-1.5">
                <Label
                    htmlFor="ai-timeout"
                    className="text-xs font-semibold text-slate-700"
                >
                    {t('aiTimeoutSeconds')} {t('aiTimeoutHelp')}
                </Label>
                <Input
                    id="ai-timeout"
                    type="number"
                    min="5"
                    max="60"
                    value={config.timeoutSeconds}
                    onChange={(e) => {
                        const newTimeout = parseInt(e.target.value, 10) || 20;
                        onChange((prev) => ({
                            ...prev,
                            timeoutSeconds: newTimeout,
                        }));
                    }}
                    className="text-xs font-mono"
                />
            </div>
        </div>
    );
}
