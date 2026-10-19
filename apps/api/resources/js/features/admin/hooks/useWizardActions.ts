import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WizardConfig } from '@aihome/config-schema';
import type { ConfigDocumentDetail } from '../types/admin-types';
import {
    saveDraft,
    discardDraft,
    publishDraft,
    rollbackVersion,
} from '../api/admin-api';

type UseWizardActionsParams = {
    readonly documentDetail: ConfigDocumentDetail | null;
    readonly draftConfig: WizardConfig | null;
    readonly initialDialog?: 'publish' | 'rollback' | null | undefined;
    readonly onReload: () => void;
    readonly onResetDirty?: () => void;
};

export function useWizardActions({
    documentDetail,
    draftConfig,
    initialDialog,
    onReload,
    onResetDirty,
}: UseWizardActionsParams) {
    const { t } = useTranslation('admin');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(
        initialDialog === 'publish',
    );
    const [isRollbackOpen, setIsRollbackOpen] = useState(
        initialDialog === 'rollback',
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const handleSave = async () => {
        if (!draftConfig) return;
        setIsSaving(true);
        try {
            const etag = documentDetail?.draftVersion?.etag ?? null;
            await saveDraft('wizard', draftConfig, 'Draft update', etag);
            setActionMessage(t('saveSuccess'));
            onResetDirty?.();
            onReload();
        } catch {
            setActionMessage(t('saveConflict'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async (label: string) => {
        setIsPublishing(true);
        try {
            const res = await publishDraft('wizard', label);
            setActionMessage(
                t('publishSuccess', { version: res.version.toString() }),
            );
            setIsPublishOpen(false);
            onResetDirty?.();
            onReload();
        } finally {
            setIsPublishing(false);
        }
    };

    const handleRollback = async (version: number) => {
        setIsRollingBack(true);
        try {
            const res = await rollbackVersion('wizard', version);
            setActionMessage(
                t('rollbackSuccess', {
                    version: version.toString(),
                    newVersion: res.version.toString(),
                }),
            );
            setIsRollbackOpen(false);
            onResetDirty?.();
            onReload();
        } finally {
            setIsRollingBack(false);
        }
    };

    const handleDiscard = async () => {
        if (!window.confirm(t('discardConfirmDescription'))) return;
        await discardDraft('wizard');
        setActionMessage(t('discardSuccess'));
        onResetDirty?.();
        onReload();
    };

    return {
        isPreviewOpen,
        setIsPreviewOpen,
        isPublishOpen,
        setIsPublishOpen,
        isRollbackOpen,
        setIsRollbackOpen,
        isSaving,
        isPublishing,
        isRollingBack,
        actionMessage,
        setActionMessage,
        handleSave,
        handlePublish,
        handleRollback,
        handleDiscard,
    };
}
