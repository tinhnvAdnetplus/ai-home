import { useTranslation } from 'react-i18next';
import { Sliders, AlertTriangle } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import type { AiConfigPayload } from '../types/admin-types';
import { AiSettingsLimits } from './AiSettingsLimits';

type AiSettingsFormProps = {
    readonly config: AiConfigPayload;
    readonly onChange: (
        updater: (prev: AiConfigPayload) => AiConfigPayload,
    ) => void;
};

export function AiSettingsForm({
    config,
    onChange,
}: AiSettingsFormProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-800">
                        {t('aiParametersTitle')}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="ai-kill-switch"
                        checked={config.isEnabled}
                        onChange={(e) => {
                            const isEnabledChecked = e.target.checked;
                            onChange((prev) => ({
                                ...prev,
                                isEnabled: isEnabledChecked,
                            }));
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <Label
                        htmlFor="ai-kill-switch"
                        className="text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                        {config.isEnabled ? t('aiEnabled') : t('aiDisabled')}
                    </Label>
                </div>
            </div>

            {!config.isEnabled && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t('killSwitchActiveWarning')}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label
                        htmlFor="ai-provider"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('aiProvider')}
                    </Label>
                    <select
                        id="ai-provider"
                        value={config.provider}
                        onChange={(e) => {
                            const selectedProvider = e.target.value;
                            if (
                                selectedProvider === 'gemini' ||
                                selectedProvider === 'claude' ||
                                selectedProvider === 'local'
                            ) {
                                const defaultModel =
                                    selectedProvider === 'gemini'
                                        ? 'gemini-3.8-flash'
                                        : selectedProvider === 'claude'
                                          ? 'claude-3-5-haiku-20241022'
                                          : 'local-heuristic-v1';
                                onChange((prev) => ({
                                    ...prev,
                                    provider: selectedProvider,
                                    model: defaultModel,
                                }));
                            }
                        }}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="gemini">{t('providerGemini')}</option>
                        <option value="claude">{t('providerClaude')}</option>
                        <option value="local">{t('providerLocal')}</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="ai-model"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('aiModel')}
                    </Label>
                    <Input
                        id="ai-model"
                        value={config.model}
                        onChange={(e) => {
                            const modelVal = e.target.value;
                            onChange((prev) => ({ ...prev, model: modelVal }));
                        }}
                        className="text-xs font-mono"
                        placeholder={t('modelPlaceholder')}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="ai-temperature"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('aiTemperatureLabel', {
                            label: t('aiTemperature'),
                            temp: config.temperature,
                        })}
                    </Label>
                    <Input
                        id="ai-temperature"
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={config.temperature}
                        onChange={(e) => {
                            const tempVal = parseFloat(e.target.value) || 0;
                            onChange((prev) => ({
                                ...prev,
                                temperature: tempVal,
                            }));
                        }}
                        className="text-xs"
                    />
                </div>
            </div>

            <AiSettingsLimits config={config} onChange={onChange} />
        </div>
    );
}
