import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Play, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Label } from '@/shared/ui/Label';
import type { AiConfigPayload, TestPromptResponse } from '../types/admin-types';
import { sampleAnswerPresets } from '../fixtures/demo-ai-settings-fixtures';
import { AiPromptTestResult } from './AiPromptTestResult';

type AiPromptTestPanelProps = {
    readonly config: AiConfigPayload;
    readonly onRunTest: (
        which: 'constraints' | 'commentary',
        prompt: string,
        answers: Record<string, unknown>,
    ) => Promise<TestPromptResponse>;
    readonly isTesting: boolean;
};

export function AiPromptTestPanel({
    config,
    onRunTest,
    isTesting,
}: AiPromptTestPanelProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [which, setWhich] = useState<'constraints' | 'commentary'>(
        'constraints',
    );
    const [presetId, setPresetId] = useState<string>('default');
    const [result, setResult] = useState<TestPromptResponse | null>(null);

    const activePreset =
        sampleAnswerPresets.find((p) => p.id === presetId) ??
        sampleAnswerPresets[0];

    const handleExecute = async () => {
        if (!activePreset) return;
        const currentPrompt = config.prompts[which].ja;
        const res = await onRunTest(which, currentPrompt, activePreset.answers);
        setResult(res);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-slate-800">
                        {t('testExecutionTitle')}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5">
                    <Label
                        htmlFor="test-target-select"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('testTargetPrompt')}
                    </Label>
                    <select
                        id="test-target-select"
                        value={which}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'constraints' || val === 'commentary')
                                setWhich(val);
                        }}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="constraints">
                            {t('targetConstraints')}
                        </option>
                        <option value="commentary">
                            {t('targetCommentary')}
                        </option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="test-preset-select"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('sampleAnswersPreset')}
                    </Label>
                    <select
                        id="test-preset-select"
                        value={presetId}
                        onChange={(e) => {
                            setPresetId(e.target.value);
                        }}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {sampleAnswerPresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        disabled={isTesting}
                        onClick={() => {
                            void handleExecute();
                        }}
                        className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isTesting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{t('runningTest')}</span>
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{t('runTestButton')}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {result && <AiPromptTestResult result={result} />}
        </div>
    );
}
