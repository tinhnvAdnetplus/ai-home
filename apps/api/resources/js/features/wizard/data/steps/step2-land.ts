import { type Step } from '@aihome/config-schema';
import { tx } from '../builders';
import { step2SectionsA } from './step2-sections-a';
import { step2SectionsB } from './step2-sections-b';
import { step2SectionsC } from './step2-sections-c';
import { step2SectionsD } from './step2-sections-d';

export const step2Land: Step = {
    key: 'step2_land',
    title: tx('土地情報', 'Land information', 'Thông tin khu đất'),
    subtitle: tx(
        '建築予定地について教えてください。土地の条件に合わせて、最適な配置・間取りをご提案します。',
        'Please tell us about your planned building site. We will propose the best layout and floor plan suited to the site conditions.',
        'Vui lòng cho biết thông tin về khu đất dự kiến xây dựng. Chúng tôi sẽ đề xuất bố cục và sơ đồ mặt bằng tối ưu theo điều kiện khu đất.',
    ),
    icon: 'map-pin',
    sections: [
        ...step2SectionsA,
        ...step2SectionsB,
        ...step2SectionsC,
        ...step2SectionsD,
    ],
};
