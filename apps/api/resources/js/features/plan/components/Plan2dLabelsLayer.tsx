import { useTranslation } from 'react-i18next';
import { type Fixture, type Room } from '@aihome/bdm';
import { computeRoomLabelLayouts } from '../lib/plan2d-label-layout';

type Plan2dLabelsLayerProps = {
    readonly rooms: readonly Room[];
    readonly fixtures?: readonly Fixture[] | undefined;
};

export function Plan2dLabelsLayer({
    rooms,
    fixtures,
}: Plan2dLabelsLayerProps): React.JSX.Element {
    const { t } = useTranslation();
    const layouts = computeRoomLabelLayouts(rooms, t, fixtures);

    return (
        <g className="plan2d-room-labels">
            {layouts.map((label) => {
                const nameY = label.hasJo
                    ? label.y - label.fontSize * 0.4
                    : label.y;
                const joY = label.y + label.fontSize * 0.68;
                const joFontSize = Math.round(label.fontSize * 0.65);

                return (
                    <g key={`label-${label.id}`} className="room-label">
                        <text
                            x={label.x}
                            y={nameY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={label.fontSize}
                            fontWeight="bold"
                            fill={label.textColor}
                            stroke="#ffffff"
                            strokeWidth={label.fontSize * 0.42}
                            strokeLinejoin="round"
                            paintOrder="stroke"
                        >
                            {label.name}
                        </text>

                        {label.hasJo ? (
                            <text
                                x={label.x}
                                y={joY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={joFontSize}
                                fill="#64748b"
                                stroke="#ffffff"
                                strokeWidth={joFontSize * 0.38}
                                strokeLinejoin="round"
                                paintOrder="stroke"
                            >
                                {label.joStr}
                                {t('plan:roomUnitJo')}
                            </text>
                        ) : null}
                    </g>
                );
            })}
        </g>
    );
}

