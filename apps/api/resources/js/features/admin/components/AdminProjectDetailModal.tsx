import { useTranslation } from 'react-i18next';
import { User, Calendar, FileText, Layers } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import type { AdminProjectItem } from '../types/admin-types';
import { AdminProjectAnswers } from './AdminProjectAnswers';
import { AdminProjectPlanRow } from './AdminProjectPlanRow';

type AdminProjectDetailModalProps = {
    readonly isOpen: boolean;
    readonly project: AdminProjectItem | null;
    readonly onClose: () => void;
};

export function AdminProjectDetailModal({
    isOpen,
    project,
    onClose,
}: AdminProjectDetailModalProps): React.JSX.Element {
    const { t } = useTranslation('admin');

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(isOpenState) => {
                if (!isOpenState) onClose();
            }}
        >
            {project && (
                <DialogContent className="sm:max-w-2xl bg-white border border-slate-200 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="space-y-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center justify-between gap-2">
                            <DialogTitle className="text-base font-bold text-slate-900">
                                {project.title}
                            </DialogTitle>
                            <Badge
                                variant="secondary"
                                className="text-xs uppercase"
                            >
                                {project.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {project.user?.name ?? '—'} (
                                {project.user?.email ?? '—'})
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {project.updatedAt
                                    ? new Date(
                                          project.updatedAt,
                                      ).toLocaleDateString()
                                    : '—'}
                            </span>
                            <span className="font-mono">
                                {t('versionPrefix', {
                                    version: project.configVersion ?? 1,
                                })}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                {t('projectAnswersTitle')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <AdminProjectAnswers
                                    answers={project.answers}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-blue-600" />
                                {t('projectPlansTitle')} ({project.plans.length}
                                )
                            </h3>
                            {project.plans.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                                    {t('noPlansGenerated')}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {project.plans.map((plan) => (
                                        <AdminProjectPlanRow
                                            key={plan.id}
                                            plan={plan}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="text-xs"
                        >
                            {t('close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
}
