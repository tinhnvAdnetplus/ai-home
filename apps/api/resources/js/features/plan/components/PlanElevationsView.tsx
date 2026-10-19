import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2 } from 'lucide-react';
import { type BuildingModel } from '@aihome/bdm';
import { renderAllElevations, type ElevationSide } from '@aihome/elevation';
import { type MaterialOptions } from '@aihome/render3d';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/Dialog';

type PlanElevationsViewProps = {
    readonly model: BuildingModel;
    readonly materials?: MaterialOptions | undefined;
};

const SIDES = [
    { side: 'south', labelKey: 'plan:elevationSouth' },
    { side: 'north', labelKey: 'plan:elevationNorth' },
    { side: 'east', labelKey: 'plan:elevationEast' },
    { side: 'west', labelKey: 'plan:elevationWest' },
] as const;

function svgToDataUrl(svg: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function PlanElevationsView({
    model,
    materials,
}: PlanElevationsViewProps): React.JSX.Element {
    const { t } = useTranslation();
    const [activeSide, setActiveSide] = useState<ElevationSide | null>(null);

    const elevations = useMemo(() => {
        return renderAllElevations(model, {
            wallColor: materials?.wall,
            roofColor: materials?.roof,
        });
    }, [model, materials]);

    const activeElevation = activeSide ? elevations[activeSide] : null;
    const activeLabelKey = SIDES.find((s) => s.side === activeSide)?.labelKey;

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {t('plan:elevationsTitle')}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                        {t('plan:elevationsSubtitle')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SIDES.map((item) => {
                    const svgString = elevations[item.side];
                    const dataUrl = svgToDataUrl(svgString);
                    const title = t(item.labelKey);

                    return (
                        <div
                            key={item.side}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                setActiveSide(item.side);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setActiveSide(item.side);
                                }
                            }}
                            className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                            aria-label={t('plan:enlargeElevation', {
                                name: title,
                            })}
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-700">
                                    {title}
                                </span>
                                <Maximize2
                                    className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0b6bdc] transition-colors"
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="h-44 sm:h-48 w-full flex items-center justify-center pt-2">
                                <img
                                    src={dataUrl}
                                    alt={title}
                                    className="h-full w-full object-contain pointer-events-none"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog
                open={activeSide !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) setActiveSide(null);
                }}
            >
                <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-4 flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {activeLabelKey ? t(activeLabelKey) : ''}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center p-2 bg-slate-50 rounded-xl overflow-hidden">
                        {activeElevation ? (
                            <img
                                src={svgToDataUrl(activeElevation)}
                                alt={activeLabelKey ? t(activeLabelKey) : ''}
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
