import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import type {
    AdminViewMode,
    WizardValidationResult,
} from '../types/admin-types';
import { WizardHeaderActions } from './WizardHeaderActions';

type WizardEditorHeaderProps = {
    readonly isDirty: boolean;
    readonly isSaving: boolean;
    readonly hasDraft: boolean;
    readonly viewMode: AdminViewMode;
    readonly validation: WizardValidationResult;
    readonly onChangeViewMode: (mode: AdminViewMode) => void;
    readonly onSaveDraft: () => void;
    readonly onOpenPreview: () => void;
    readonly onOpenPublish: () => void;
    readonly onOpenRollback: () => void;
    readonly onDiscardDraft: () => void;
};

export function WizardEditorHeader({
    isDirty,
    isSaving,
    hasDraft,
    viewMode,
    validation,
    onChangeViewMode,
    onSaveDraft,
    onOpenPreview,
    onOpenPublish,
    onOpenRollback,
    onDiscardDraft,
}: WizardEditorHeaderProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                        type="button"
                        onClick={() => {
                            onChangeViewMode('visual');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            viewMode === 'visual'
                                ? 'bg-white text-blue-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {t('tabVisual')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onChangeViewMode('raw');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            viewMode === 'raw'
                                ? 'bg-white text-blue-700 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {t('tabRawJson')}
                    </button>
                </div>

                {validation.isValid ? (
                    <Badge variant="success" className="text-xs py-1">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {t('validationValid')}
                    </Badge>
                ) : (
                    <Badge variant="destructive" className="text-xs py-1">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        {t('validationErrors', {
                            count: validation.issues.length.toString(),
                        })}
                    </Badge>
                )}
            </div>

            <WizardHeaderActions
                isDirty={isDirty}
                isSaving={isSaving}
                hasDraft={hasDraft}
                isValid={validation.isValid}
                onSaveDraft={onSaveDraft}
                onOpenPreview={onOpenPreview}
                onOpenPublish={onOpenPublish}
                onOpenRollback={onOpenRollback}
                onDiscardDraft={onDiscardDraft}
            />
        </div>
    );
}
