import { useTranslation } from 'react-i18next';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Footprints,
} from 'lucide-react';
import { type WalkInput } from '../lib/walk-controller.js';

type Props = {
    readonly stairTarget: number | null;
    readonly currentLevel: number;
    readonly onInput: (input: WalkInput, isOn: boolean) => void;
    readonly onChangeLevel: (level: number) => void;
};

const PAD: readonly {
    readonly input: WalkInput;
    readonly label: 'forward' | 'back' | 'left' | 'right';
    readonly Icon: typeof ArrowUp;
    readonly pos: string;
}[] = [
    {
        input: 'forward',
        label: 'forward',
        Icon: ArrowUp,
        pos: 'col-start-2 row-start-1',
    },
    {
        input: 'left',
        label: 'left',
        Icon: ArrowLeft,
        pos: 'col-start-1 row-start-2',
    },
    {
        input: 'back',
        label: 'back',
        Icon: ArrowDown,
        pos: 'col-start-2 row-start-2',
    },
    {
        input: 'right',
        label: 'right',
        Icon: ArrowRight,
        pos: 'col-start-3 row-start-2',
    },
];

export function WalkOverlay(props: Props): React.JSX.Element {
    const { t } = useTranslation();
    return (
        <>
            <div className="absolute bottom-12 left-3 z-10 grid grid-cols-3 gap-1 pointer-events-auto sm:hidden">
                {PAD.map(({ input, label, Icon, pos }) => (
                    <button
                        key={input}
                        type="button"
                        aria-label={t(`plan3d:walk.${label}`)}
                        className={`${pos} h-11 w-11 rounded-xl bg-white/90 border border-slate-200 shadow-md flex items-center justify-center touch-none`}
                        onPointerDown={() => {
                            props.onInput(input, true);
                        }}
                        onPointerUp={() => {
                            props.onInput(input, false);
                        }}
                        onPointerLeave={() => {
                            props.onInput(input, false);
                        }}
                    >
                        <Icon className="h-5 w-5 text-slate-700" />
                    </button>
                ))}
            </div>
            {props.stairTarget !== null && (
                <button
                    type="button"
                    onClick={() => {
                        if (props.stairTarget !== null)
                            props.onChangeLevel(props.stairTarget);
                    }}
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg pointer-events-auto inline-flex items-center gap-2"
                >
                    <Footprints className="h-4 w-4" />
                    {props.stairTarget > props.currentLevel
                        ? t('plan3d:walk.goUp', { level: props.stairTarget })
                        : t('plan3d:walk.goDown', { level: props.stairTarget })}
                </button>
            )}
        </>
    );
}
