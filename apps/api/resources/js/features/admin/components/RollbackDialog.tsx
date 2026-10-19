import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Label } from '@/shared/ui/Label';
import type { ConfigVersionMeta } from '../types/admin-types';

type RollbackDialogProps = {
    readonly isOpen: boolean;
    readonly isRollingBack: boolean;
    readonly versions: readonly ConfigVersionMeta[];
    readonly currentPublishedVersion: number | null;
    readonly onClose: () => void;
    readonly onConfirm: (version: number) => void;
};

export function RollbackDialog({
    isOpen,
    isRollingBack,
    versions,
    currentPublishedVersion,
    onClose,
    onConfirm,
}: RollbackDialogProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const availableVersions = versions.filter(
        (v) => v.version !== currentPublishedVersion,
    );
    const [selectedVersion, setSelectedVersion] = useState<number | null>(
        availableVersions[0]?.version ?? null,
    );

    const handleConfirm = () => {
        if (selectedVersion !== null) {
            onConfirm(selectedVersion);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpenState) => {
                if (!isOpenState && !isRollingBack) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md bg-white border border-slate-200">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                        <RotateCcw className="w-5 h-5" />
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {t('rollbackDialogTitle')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                        {t('rollbackDialogDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>{t('rollbackWarning')}</span>
                </div>

                <div className="space-y-2 py-2">
                    <Label
                        htmlFor="rollback-version"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('selectRollbackVersion')}
                    </Label>
                    <select
                        id="rollback-version"
                        value={selectedVersion ?? ''}
                        onChange={(e) => {
                            setSelectedVersion(Number(e.target.value));
                        }}
                        disabled={isRollingBack}
                        className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
                    >
                        {availableVersions.map((v) => (
                            <option key={v.version} value={v.version}>
                                {t('versionOptionFormat', {
                                    version: v.version.toString(),
                                    date: v.publishedAt
                                        ? new Date(
                                              v.publishedAt,
                                          ).toLocaleDateString()
                                        : 'N/A',
                                    label: v.label ?? '-',
                                })}
                            </option>
                        ))}
                    </select>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isRollingBack}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={selectedVersion === null || isRollingBack}
                        isLoading={isRollingBack}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isRollingBack
                            ? t('rollingBack')
                            : t('confirmRollback')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
