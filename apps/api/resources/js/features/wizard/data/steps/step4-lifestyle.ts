import { type Step } from '@aihome/config-schema';
import { tx } from '../builders';
import { step4SectionsA } from './step4-sections-a';
import { step4SectionsB } from './step4-sections-b';
import { step4SectionsC } from './step4-sections-c';
import { step4SectionsD } from './step4-sections-d';

export const step4Lifestyle: Step = {
    key: 'step4_lifestyle',
    title: tx('暮らし方の希望', 'Lifestyle preferences', 'Phong cách sống'),
    subtitle: tx(
        '日常の生活スタイルやこだわりを教えてください。\nあなたのライフスタイルに合った間取り・動線・設備をご提案します。',
        'Tell us about your daily lifestyle and priorities. We will suggest a floor plan, traffic flow, and amenities tailored to your lifestyle.',
        'Hãy chia sẻ về lối sống hàng ngày và sở thích của bạn. Hệ thống sẽ đề xuất mặt bằng, luồng di chuyển và trang thiết bị phù hợp nhất.',
    ),
    icon: 'users',
    sections: [
        ...step4SectionsA,
        ...step4SectionsB,
        ...step4SectionsC,
        ...step4SectionsD,
    ],
};
