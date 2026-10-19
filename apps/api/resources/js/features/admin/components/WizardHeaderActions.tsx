import { useTranslation } from 'react-i18next';
import { Save, Eye, UploadCloud, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type WizardHeaderActionsProps = {
    readonly isDirty: boolean;
    readonly isSaving: boolean;
    readonly hasDraft: boolean;
    readonly isValid: boolean;
    readonly onSaveDraft: () => void;
    readonly onOpenPreview: () => void;
    readonly onOpenPublish: () => void;
    readonly onOpenRollback: () => void;
    readonly onDiscardDraft: () => void;
};

export function WizardHeaderActions({
    isDirty,
    isSaving,
    hasDraft,
    isValid,
    onSaveDraft,
    onOpenPreview,
    onOpenPublish,
    onOpenRollback,
    onDiscardDraft,
}: WizardHeaderActionsProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                onClick={onOpenPreview}
                disabled={!isValid}
                title={t('preview')}
            >
                <Eye className="w-3.5 h-3.5 mr-1" />
                {t('preview')}
            </Button>

            <Button
                size="sm"
                onClick={onSaveDraft}
                disabled={!isDirty || isSaving}
                isLoading={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                <Save className="w-3.5 h-3.5 mr-1" />
                {isSaving ? t('saving') : t('saveDraft')}
            </Button>

            <Button
                size="sm"
                onClick={onOpenPublish}
                disabled={!hasDraft && !isDirty}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
                <UploadCloud className="w-3.5 h-3.5 mr-1" />
                {t('publish')}
            </Button>

            <Button
                size="sm"
                variant="outline"
                onClick={onOpenRollback}
                title={t('rollback')}
            >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                {t('rollback')}
            </Button>

            {hasDraft && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDiscardDraft}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    title={t('discardDraft')}
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t('discardDraft')}
                </Button>
            )}
        </div>
    );
}
