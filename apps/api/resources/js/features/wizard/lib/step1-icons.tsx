import {
    Step1HouseIcon,
    Step1OtherIcon,
    Step1RebuildIcon,
    Step1RenovateIcon,
    Step1RentalIcon,
    Step1TwoHousesIcon,
    type Step1IconProps,
} from './step1-icons-cards12';
import {
    Step1ConsultIcon,
    Step1OneStoryIcon,
    Step1ThreeStoryIcon,
    Step1TwoStoryIcon,
} from './step1-icons-card3';

const STEP1_ICONS: Readonly<
    Record<string, React.ComponentType<Step1IconProps>>
> = {
    'icon-home': Step1HouseIcon,
    'icon-rebuild': Step1RebuildIcon,
    'icon-renovate': Step1RenovateIcon,
    'icon-custom': Step1HouseIcon,
    'icon-two-family': Step1TwoHousesIcon,
    'icon-rental': Step1RentalIcon,
    'icon-other': Step1OtherIcon,
    'icon-one-story': Step1OneStoryIcon,
    'icon-two-story': Step1TwoStoryIcon,
    'icon-three-story': Step1ThreeStoryIcon,
    'icon-consult': Step1ConsultIcon,
};

export function isStep1SpecialIcon(mediaId: string): boolean {
    return mediaId in STEP1_ICONS;
}

type Step1TileIconProps = {
    readonly mediaId: string;
    readonly isSelected: boolean;
    readonly className?: string | undefined;
};

export function Step1TileIcon({
    mediaId,
    isSelected,
    className,
}: Step1TileIconProps): React.JSX.Element | null {
    const Component = STEP1_ICONS[mediaId];
    if (!Component) {
        return null;
    }
    return <Component className={className} isSelected={isSelected} />;
}
