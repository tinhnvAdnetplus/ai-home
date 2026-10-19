import { useTranslation } from 'react-i18next';
import { getTilePhoto } from '../../lib/tile-photos';

const SAMPLES = [
    { key: 'land-sample-survey', labelKey: 'wizard:sampleSurvey' },
    { key: 'land-sample-site', labelKey: 'wizard:sampleSite' },
    { key: 'land-sample-photo', labelKey: 'wizard:samplePhoto' },
] as const;

export function Step2DrawingsPhotosThumbnails(): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="grid flex-1 grid-cols-3 gap-1.5 sm:gap-2.5 items-center min-w-0 w-full">
            {SAMPLES.map((sample) => {
                const photo = getTilePhoto(sample.key);

                return (
                    <div
                        key={sample.key}
                        className="flex flex-col items-center"
                    >
                        <div className="aspect-[5/4] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
                            {photo ? (
                                <img
                                    src={photo}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-100" />
                            )}
                        </div>
                        <span className="mt-1 block max-w-full truncate text-center text-[11px] font-medium text-slate-700">
                            {t(sample.labelKey)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
