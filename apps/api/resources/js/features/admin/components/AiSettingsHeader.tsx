import { useTranslation } from 'react-i18next';
import { Save, UploadCloud, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import type { ConfigDocumentDetail } from '../types/admin-types';

type AiSettingsHeaderProps = {
    readonly documentDetail: ConfigDocumentDetail | null;
    readonly isSaving: boolean;
    readonly isDirty: boolean;
    readonly onSave: () => void;
    readonly onOpenPublish: () => void;
    readonly onOpenRollback: () => void;
};

export function AiSettingsHeader({
    documentDetail,
    isSaving,
    isDirty,
    onSave,
    onOpenPublish,
    onOpenRollback,
}: AiSettingsHeaderProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    const publishedVer = documentDetail?.publishedVersion?.version ?? null;
    const draftVer = documentDetail?.draftVersion?.version ?? null;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        {t('aiSettingsTitle')}
                    </h1>
                    {publishedVer !== null && (
                        <Badge variant="success" className="text-xs">
                            {t('publishedVersion', { version: publishedVer })}
                        </Badge>
                    )}
                    {draftVer !== null && (
                        <Badge variant="warning" className="text-xs">
                            {t('draftVersion', { version: draftVer })}
                        </Badge>
                    )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                    {t('aiSettingsSubtitle')}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenRollback}
                    disabled={publishedVer === null}
                    className="text-xs flex items-center gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('rollback')}</span>
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving || !isDirty}
                    isLoading={isSaving}
                    className="text-xs flex items-center gap-1.5"
                >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('saveDraft')}</span>
                </Button>

                <Button
                    type="button"
                    size="sm"
                    onClick={onOpenPublish}
                    className="text-xs flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{t('publish')}</span>
                </Button>
            </div>
        </div>
    );
}
