import { type Step } from '@aihome/config-schema';
import { tx } from '../builders';
import { step3SectionsA } from './step3-sections-a';
import { step3SectionsB } from './step3-sections-b';
import { step3SectionsC } from './step3-sections-c';
import { step3SectionsD } from './step3-sections-d';
import { step3SectionsE } from './step3-sections-e';

export const step3Floorplan: Step = {
    key: 'step3_floorplan',
    title: tx('間取りの希望', 'Floor plan preferences', 'Nhu cầu mặt bằng'),
    subtitle: tx(
        '必要な部屋の数・広さ・設備について教えてください。入力内容をもとに、最適な間取りをご提案します。',
        'Please tell us about the rooms, sizes, and amenities you need. We will propose the optimal floor plan based on your input.',
        'Vui lòng cho biết số lượng phòng, diện tích và trang thiết bị cần thiết. Dựa trên nội dung nhập, hệ thống sẽ đề xuất mặt bằng tối ưu.',
    ),
    icon: 'layout-grid',
    sections: [
        ...step3SectionsA,
        ...step3SectionsB,
        ...step3SectionsC,
        ...step3SectionsD,
        ...step3SectionsE,
    ],
};
