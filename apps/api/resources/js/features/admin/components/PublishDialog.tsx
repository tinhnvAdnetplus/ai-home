import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';

type PublishDialogProps = {
    readonly isOpen: boolean;
    readonly isPublishing: boolean;
    readonly onClose: () => void;
    readonly onConfirm: (label: string) => void;
};

export function PublishDialog({
    isOpen,
    isPublishing,
    onClose,
    onConfirm,
}: PublishDialogProps): React.JSX.Element {
    const { t } = useTranslation('admin');
    const [label, setLabel] = useState('');

    const handleConfirm = () => {
        onConfirm(label.trim());
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpenState) => {
                if (!isOpenState && !isPublishing) onClose();
            }}
        >
            <DialogContent className="sm:max-w-md bg-white border border-slate-200">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <UploadCloud className="w-5 h-5" />
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {t('publishDialogTitle')}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                        {t('publishDialogDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>{t('publishWarning')}</span>
                </div>

                <div className="space-y-1.5 py-2">
                    <Label
                        htmlFor="publish-label"
                        className="text-xs font-semibold text-slate-700"
                    >
                        {t('publishLabel')}
                    </Label>
                    <Input
                        id="publish-label"
                        value={label}
                        onChange={(e) => {
                            setLabel(e.target.value);
                        }}
                        placeholder={t('publishLabelPlaceholder')}
                        maxLength={120}
                        disabled={isPublishing}
                        className="text-xs bg-white"
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isPublishing}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirm}
                        disabled={isPublishing}
                        isLoading={isPublishing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isPublishing ? t('publishing') : t('confirmPublish')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
