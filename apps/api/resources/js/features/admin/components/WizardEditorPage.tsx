import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { Field } from '@aihome/config-schema';
import type {
    ConfigVersionMeta,
    ConfigDocumentDetail,
} from '../types/admin-types';
import { useWizardDraft, extractInitialConfig } from '../hooks/useWizardDraft';
import { useWizardActions } from '../hooks/useWizardActions';
import { WizardEditorHeader } from './WizardEditorHeader';
import { WizardTree } from './WizardTree';
import { FieldEditor } from './FieldEditor';
import { RawJsonEditor } from './RawJsonEditor';
import { ValidationPanel } from './ValidationPanel';
import { WizardEditorModals } from './WizardEditorModals';

type WizardEditorPageProps = {
    readonly documentDetail: ConfigDocumentDetail | null;
    readonly versions: readonly ConfigVersionMeta[];
    readonly initialViewMode?: 'visual' | 'raw';
    readonly initialDialog?: 'publish' | 'rollback' | null;
    readonly onReload: () => void;
};

export function WizardEditorPage({
    documentDetail,
    versions,
    initialViewMode,
    initialDialog,
    onReload,
}: WizardEditorPageProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const initialConfig = extractInitialConfig(documentDetail);

    const {
        draftConfig,
        isDirty,
        setIsDirty,
        selectedStepIndex,
        selectedSectionIndex,
        selectedFieldKey,
        selectField,
        updateField,
        viewMode,
        setViewMode,
        rawJson,
        applyRawJson,
        validation,
    } = useWizardDraft(initialConfig, initialViewMode);

    const actions = useWizardActions({
        documentDetail,
        draftConfig,
        initialDialog,
        onReload,
        onResetDirty: () => {
            setIsDirty(false);
        },
    });

    const selectedField: Field | null =
        draftConfig?.steps[selectedStepIndex]?.sections[
            selectedSectionIndex
        ]?.fields.find((f) => f.key === selectedFieldKey) ??
        draftConfig?.steps[0]?.sections[0]?.fields[0] ??
        null;

    return (
        <div className="space-y-4">
            <WizardEditorHeader
                isDirty={isDirty}
                isSaving={actions.isSaving}
                hasDraft={Boolean(documentDetail?.draftVersion)}
                viewMode={viewMode}
                validation={validation}
                onChangeViewMode={setViewMode}
                onSaveDraft={() => void actions.handleSave()}
                onOpenPreview={() => {
                    actions.setIsPreviewOpen(true);
                }}
                onOpenPublish={() => {
                    actions.setIsPublishOpen(true);
                }}
                onOpenRollback={() => {
                    actions.setIsRollbackOpen(true);
                }}
                onDiscardDraft={() => void actions.handleDiscard()}
            />

            {actions.actionMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex justify-between items-center">
                    <span>{actions.actionMessage}</span>
                    <button
                        type="button"
                        aria-label={t('close')}
                        onClick={() => {
                            actions.setActionMessage(null);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <ValidationPanel issues={validation.issues} />

            {viewMode === 'visual' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-5 xl:col-span-4">
                        <WizardTree
                            wizard={draftConfig}
                            selectedStepIndex={selectedStepIndex}
                            selectedSectionIndex={selectedSectionIndex}
                            selectedFieldKey={selectedField?.key ?? null}
                            onSelectField={selectField}
                        />
                    </div>
                    <div className="lg:col-span-7 xl:col-span-8">
                        <FieldEditor
                            field={selectedField}
                            onFieldChange={updateField}
                        />
                    </div>
                </div>
            ) : (
                <RawJsonEditor rawJson={rawJson} onApply={applyRawJson} />
            )}

            <WizardEditorModals
                actions={actions}
                draftConfig={draftConfig}
                versions={versions}
                currentPublishedVersion={
                    documentDetail?.publishedVersion?.version ?? null
                }
            />
        </div>
    );
}
