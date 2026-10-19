import type { WizardConfig } from '@aihome/config-schema';
import type { ConfigVersionMeta } from '../types/admin-types';
import type { useWizardActions } from '../hooks/useWizardActions';
import { WizardPreviewModal } from './WizardPreviewModal';
import { PublishDialog } from './PublishDialog';
import { RollbackDialog } from './RollbackDialog';

type WizardEditorModalsProps = {
    readonly actions: ReturnType<typeof useWizardActions>;
    readonly draftConfig: WizardConfig | null;
    readonly versions: readonly ConfigVersionMeta[];
    readonly currentPublishedVersion: number | null;
};

export function WizardEditorModals({
    actions,
    draftConfig,
    versions,
    currentPublishedVersion,
}: WizardEditorModalsProps): React.JSX.Element {
    return (
        <>
            <WizardPreviewModal
                isOpen={actions.isPreviewOpen}
                onClose={() => {
                    actions.setIsPreviewOpen(false);
                }}
                draftConfig={draftConfig}
            />

            <PublishDialog
                isOpen={actions.isPublishOpen}
                isPublishing={actions.isPublishing}
                onClose={() => {
                    actions.setIsPublishOpen(false);
                }}
                onConfirm={(label) => void actions.handlePublish(label)}
            />

            <RollbackDialog
                isOpen={actions.isRollbackOpen}
                isRollingBack={actions.isRollingBack}
                versions={versions}
                currentPublishedVersion={currentPublishedVersion}
                onClose={() => {
                    actions.setIsRollbackOpen(false);
                }}
                onConfirm={(ver) => void actions.handleRollback(ver)}
            />
        </>
    );
}
