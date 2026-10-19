import { type Step } from '@aihome/config-schema';
import { tx } from '../builders';
import { step5SectionsA } from './step5-sections-a';
import { step5SectionsB } from './step5-sections-b';
import { step5SectionsC } from './step5-sections-c';
import { step5SectionsD } from './step5-sections-d';

export const step5Design: Step = {
    key: 'step5_design',
    title: tx('デザインの希望', 'Design preferences', 'Nguyện vọng thiết kế'),
    subtitle: tx(
        '外観・内装のスタイルや、好きなイメージを教えてください。\n選んだデザインをもとに、立体パースと図面を自動作成します。',
        'Tell us your exterior and interior style preferences. 3D perspectives and floor plans will be automatically generated based on your chosen design.',
        'Vui lòng cho biết phong cách ngoại thất, nội thất yêu thích. Hệ thống sẽ tự động tạo phối cảnh 3D và bản vẽ dựa trên thiết kế bạn chọn.',
    ),
    icon: 'palette',
    sections: [
        ...step5SectionsA,
        ...step5SectionsB,
        ...step5SectionsC,
        ...step5SectionsD,
    ],
};
