import { type Step } from '@aihome/config-schema';
import { tx } from '../builders';
import { step1SectionsA } from './step1-sections-a';
import { step1SectionsB } from './step1-sections-b';
import { step1SectionsC } from './step1-sections-c';
import { step1SectionsD } from './step1-sections-d';

export const step1Basic: Step = {
    key: 'step1_basic',
    title: tx('基本情報', 'Basic information', 'Thông tin cơ bản'),
    subtitle: tx(
        'まずは、建てたい住宅の基本的な条件を教えてください。',
        'First, tell us the basic conditions of the house you want to build.',
        'Trước tiên, hãy cho biết các điều kiện cơ bản của ngôi nhà bạn muốn xây.',
    ),
    icon: 'home',
    sections: [
        ...step1SectionsA,
        ...step1SectionsB,
        ...step1SectionsC,
        ...step1SectionsD,
    ],
};
