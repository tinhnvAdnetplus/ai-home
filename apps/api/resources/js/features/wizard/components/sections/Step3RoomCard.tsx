import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { resolveLocalized } from '../../lib/field-helpers';
import { getTilePhoto } from '../../lib/tile-photos';
import { type RoomConfig, DEFAULT_COUNT_VALUE } from './Step3RoomConfigs';

type Step3RoomCardProps = {
    readonly room: RoomConfig;
    readonly answers: Record<string, unknown>;
    readonly onAnswerChange: (key: string, value: unknown) => void;
    readonly isDisabled?: boolean | undefined;
};

export function Step3RoomCard({
    room,
    answers,
    onAnswerChange,
    isDisabled = false,
}: Step3RoomCardProps): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const photo = getTilePhoto(room.photoName);
    const FallbackIcon = room.fallbackIcon;

    const rawCount = answers[room.countKey];
    const currentCount =
        typeof rawCount === 'string'
            ? rawCount
            : (room.countOptions[0]?.value ?? DEFAULT_COUNT_VALUE);

    const rawSize = answers[room.sizeKey];
    const currentSize = typeof rawSize === 'string' ? rawSize : '';
    const isZero = currentCount === DEFAULT_COUNT_VALUE;

    return (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs hover:border-slate-300 transition-colors">
            {/* Photo or Fallback Icon */}
            <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                {photo ? (
                    <img
                        src={photo}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FallbackIcon
                        className="w-6 h-6 text-slate-400 stroke-[1.5]"
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Room Title + Two Selects */}
            <div className="flex-1 min-w-0">
                <div className="h-7 sm:h-8 flex items-center mb-0.5">
                    <h3 className="text-xs xl:text-[13px] font-bold text-slate-800 leading-tight">
                        {resolveLocalized(room.title, i18n.language)}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5">
                    {/* Count Select */}
                    <div className="w-12 xl:w-14 shrink-0">
                        <label
                            htmlFor={room.countKey}
                            className="text-xs xl:text-[12px] font-medium text-slate-600 block mb-0.5"
                        >
                            {t('wizard:roomCountLabel')}
                        </label>
                        <div className="relative">
                            <select
                                id={room.countKey}
                                value={currentCount}
                                onChange={(e) => {
                                    onAnswerChange(
                                        room.countKey,
                                        e.target.value,
                                    );
                                }}
                                disabled={isDisabled}
                                className="w-full h-10 sm:h-7.5 rounded-md border border-slate-300 bg-white pl-2 pr-5 text-[16px] sm:text-xs xl:text-[12.5px] font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                            >
                                {room.countOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {resolveLocalized(
                                            opt.label,
                                            i18n.language,
                                        )}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        </div>
                    </div>

                    {/* Size Select */}
                    <div className="flex-1 min-w-0">
                        <label
                            htmlFor={room.sizeKey}
                            className="text-xs xl:text-[12px] font-medium text-slate-600 block mb-0.5"
                        >
                            {t('wizard:roomSizeLabel')}
                        </label>
                        <div className="relative">
                            <select
                                id={room.sizeKey}
                                value={currentSize}
                                onChange={(e) => {
                                    onAnswerChange(
                                        room.sizeKey,
                                        e.target.value,
                                    );
                                }}
                                disabled={isDisabled || isZero}
                                className="w-full h-10 sm:h-7.5 rounded-md border border-slate-300 bg-white pl-2 pr-5 text-[16px] sm:text-xs xl:text-[12.5px] text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                            >
                                <option value="">
                                    {t('wizard:selectPlaceholder')}
                                </option>
                                {room.sizeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {resolveLocalized(
                                            opt.label,
                                            i18n.language,
                                        )}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
