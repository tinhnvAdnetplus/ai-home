import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAiSettings } from '../hooks/useAiSettings';
import { AiSettingsHeader } from './AiSettingsHeader';
import { AiSettingsForm } from './AiSettingsForm';
import { AiPromptsEditor } from './AiPromptsEditor';
import { AiPromptTestPanel } from './AiPromptTestPanel';
import { PublishDialog } from './PublishDialog';
import { RollbackDialog } from './RollbackDialog';

export function AiSettingsPage(): React.JSX.Element {
    const { t } = useTranslation('admin');
    const {
        doc,
        isLoading,
        config,
        isDirty,
        isTesting,
        isPublishOpen,
        isRollbackOpen,
        isSaving,
        isPublishing,
        isRollingBack,
        updateConfig,
        saveDraft,
        publishDraft,
        rollbackVersion,
        openPublish,
        closePublish,
        openRollback,
        closeRollback,
        runTest,
    } = useAiSettings();

    if (isLoading && !doc) {
        return (
            <div className="flex items-center justify-center p-12 text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm">{t('loading')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AiSettingsHeader
                documentDetail={doc}
                isSaving={isSaving}
                isDirty={isDirty}
                onSave={() => {
                    saveDraft();
                }}
                onOpenPublish={() => {
                    openPublish();
                }}
                onOpenRollback={() => {
                    openRollback();
                }}
            />

            <AiSettingsForm config={config} onChange={updateConfig} />

            <AiPromptsEditor config={config} onChange={updateConfig} />

            <AiPromptTestPanel
                config={config}
                onRunTest={runTest}
                isTesting={isTesting}
            />

            <PublishDialog
                isOpen={isPublishOpen}
                isPublishing={isPublishing}
                onClose={() => {
                    closePublish();
                }}
                onConfirm={(label) => {
                    publishDraft(label);
                }}
            />

            <RollbackDialog
                isOpen={isRollbackOpen}
                isRollingBack={isRollingBack}
                versions={doc?.recentVersions ?? []}
                currentPublishedVersion={doc?.publishedVersion?.version ?? null}
                onClose={() => {
                    closeRollback();
                }}
                onConfirm={(ver) => {
                    rollbackVersion(ver);
                }}
            />
        </div>
    );
}
