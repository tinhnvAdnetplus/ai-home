import { useTranslation } from 'react-i18next';

type Props = {
    readonly wallColor: string;
    readonly roofColor: string;
    readonly floorColor: string;
    readonly onChangeWall: (color: string) => void;
    readonly onChangeRoof: (color: string) => void;
    readonly onChangeFloor: (color: string) => void;
};

export function MaterialColorPicker(props: Props): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 min-h-[44px]">
                <span>{t('plan3d:wallColor')}</span>
                <input
                    type="color"
                    value={props.wallColor}
                    onChange={(e) => {
                        props.onChangeWall(e.target.value);
                    }}
                    className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-md border border-slate-300 cursor-pointer p-0"
                />
            </label>
            <label className="flex items-center gap-1.5 text-slate-600 min-h-[44px]">
                <span>{t('plan3d:roofColor')}</span>
                <input
                    type="color"
                    value={props.roofColor}
                    onChange={(e) => {
                        props.onChangeRoof(e.target.value);
                    }}
                    className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-md border border-slate-300 cursor-pointer p-0"
                />
            </label>
            <label className="flex items-center gap-1.5 text-slate-600 min-h-[44px]">
                <span>{t('plan3d:floorColor')}</span>
                <input
                    type="color"
                    value={props.floorColor}
                    onChange={(e) => {
                        props.onChangeFloor(e.target.value);
                    }}
                    className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-md border border-slate-300 cursor-pointer p-0"
                />
            </label>
        </div>
    );
}
