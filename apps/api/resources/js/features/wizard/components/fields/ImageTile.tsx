import { getOptionVisual } from '../../lib/option-visuals';
import { getPhotoTile } from '../../lib/style-photos';
import { getTilePhoto } from '../../lib/tile-photos';
import { isStep1SpecialIcon } from '../../lib/step1-icons';
import { isLandShape } from '../../lib/land-shape-svg';
import { isRoadDirection } from '../../lib/road-direction-svg';
import { type ImageTileProps } from './ImageTileTypes';
import { Step1Tile } from './Step1Tile';
import { StylePhotoTile } from './StylePhotoTile';
import { LandShapeTile } from './LandShapeTile';
import { RoadDirectionTile } from './RoadDirectionTile';
import { PlanTypeTile } from './PlanTypeTile';
import { GeneralPhotoTile } from './GeneralPhotoTile';
import { SwatchTile } from './SwatchTile';
import { DefaultIconTile } from './DefaultIconTile';

export function ImageTile(props: ImageTileProps): React.JSX.Element {
    const { option, isMultiple } = props;
    const { Icon, tone, swatch } = getOptionVisual(option.image.mediaId);
    const tileName = option.image.mediaId.replace(/^tile-/, '');
    const photo =
        getTilePhoto(tileName) ??
        getTilePhoto(option.image.mediaId) ??
        getPhotoTile(option.image.mediaId);

    // Step 1 purpose, housing type, stories special icons
    if (isStep1SpecialIcon(option.image.mediaId)) {
        return <Step1Tile {...props} />;
    }

    // Step 1 Card 7: Style photo tiles ~150x100 each, 2x2 grid
    if (photo && option.image.mediaId.startsWith('style-') && !isMultiple) {
        return <StylePhotoTile {...props} photo={photo} />;
    }

    // Land shape flat polygon illustration (Step 2 Card 3)
    if (isLandShape(option.image.mediaId) || isLandShape(option.value)) {
        return <LandShapeTile {...props} />;
    }

    // Road direction map illustration (Step 2 Card 5)
    if (
        isRoadDirection(option.image.mediaId) ||
        isRoadDirection(option.value)
    ) {
        return <RoadDirectionTile {...props} />;
    }

    // Plan type tile with radio-style circle and outline house (Step 3 Card 1)
    if (option.image.mediaId.startsWith('tile-plan-type-')) {
        return <PlanTypeTile {...props} photo={photo} FallbackIcon={Icon} />;
    }

    // General photo tile
    if (photo) {
        return <GeneralPhotoTile {...props} photo={photo} />;
    }

    // Color or flooring swatch tile
    if (swatch) {
        return <SwatchTile {...props} swatch={swatch} />;
    }

    // Default icon fallback tile
    return <DefaultIconTile {...props} Icon={Icon} tone={tone} />;
}
