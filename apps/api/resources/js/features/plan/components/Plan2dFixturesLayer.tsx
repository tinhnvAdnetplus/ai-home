import { useTranslation } from 'react-i18next';
import { type Floor } from '@aihome/bdm';
import { Plan2dFixtures } from './Plan2dFixtures';

type Plan2dFixturesLayerProps = {
    readonly floor: Floor;
};

export function Plan2dFixturesLayer({
    floor,
}: Plan2dFixturesLayerProps): React.JSX.Element {
    const { t } = useTranslation();
    const upLabel = t('plan:stairUp');

    return <Plan2dFixtures floor={floor} upLabel={upLabel} />;
}
