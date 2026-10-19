import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/ui/Dialog';

export interface DeleteProjectDialogProps {
    readonly isOpen: boolean;
    readonly onOpenChange: (isOpen: boolean) => void;
    readonly projectTitle: string;
    readonly onConfirm: () => Promise<void>;
    readonly isDeleting: boolean;
}

export function DeleteProjectDialog({
    isOpen,
    onOpenChange,
    projectTitle,
    onConfirm,
    isDeleting,
}: DeleteProjectDialogProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t('projects:deleteConfirmTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('projects:deleteConfirmDescription', {
                            title: projectTitle,
                        })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                        }}
                        className="min-h-[44px] rounded-xl"
                    >
                        {t('projects:cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => void onConfirm()}
                        className="min-h-[44px] rounded-xl"
                    >
                        <FileText
                            className="mr-1.5 h-4 w-4"
                            aria-hidden="true"
                        />
                        <span>
                            {isDeleting
                                ? t('projects:deleting')
                                : t('projects:confirmDelete')}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
