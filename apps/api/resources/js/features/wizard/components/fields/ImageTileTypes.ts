import { type Field } from '@aihome/config-schema';

export type ImageOption = Extract<
    Field,
    { type: 'image_select' }
>['options'][number];

export type ImageTileProps = {
    readonly option: ImageOption;
    readonly isMultiple: boolean;
    readonly isSelected: boolean;
    readonly isDisabled: boolean;
    readonly isAccent?: boolean | undefined;
    readonly onPick: (value: string) => void;
};
