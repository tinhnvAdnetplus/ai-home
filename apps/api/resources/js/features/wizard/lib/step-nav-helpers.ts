import {
    Home,
    Image as ImageIcon,
    LayoutGrid,
    MapPin,
    Users,
    type LucideIcon,
} from 'lucide-react';
import heroStep2 from '../assets/generated/hero-step2.jpg';
import heroStep3 from '../assets/generated/hero-step3.jpg';
import heroStep4 from '../assets/generated/hero-step4.jpg';
import heroStep5 from '../assets/generated/hero-step5.jpg';

export const STEP_ICONS: readonly LucideIcon[] = [
    Home,
    MapPin,
    LayoutGrid,
    Users,
    ImageIcon,
];

export function getHeroPhoto(index: number): string {
    if (index === 2) return heroStep3;
    if (index === 3) return heroStep4;
    if (index === 4) return heroStep5;
    return heroStep2;
}

const JAPANESE_CHARS = /[\u3040-\u30ff\u4e00-\u9fff]/;

/** Line breaks tuned for the Japanese captions; other languages wrap naturally. */
export function getStepCaption(
    index: number,
    t: (
        k:
            | 'wizard:captionStep2'
            | 'wizard:captionStep3'
            | 'wizard:captionStep4'
            | 'wizard:captionStep5',
    ) => string,
): string {
    const key =
        index === 2
            ? 'wizard:captionStep3'
            : index === 3
              ? 'wizard:captionStep4'
              : index === 4
                ? 'wizard:captionStep5'
                : 'wizard:captionStep2';
    const text = t(key);
    if (!JAPANESE_CHARS.test(text)) return text;
    if (index === 2) return text.replace(/ /g, '\n');
    if (index === 3) {
        return text
            .replace(/、/g, '、\n')
            .replace(/もっと快適な/g, 'もっと快適な\n');
    }
    if (index === 4) {
        return text
            .replace(/、/g, '、\n')
            .replace(/あなただけの/g, 'あなただけの\n');
    }
    return text
        .replace(/、/g, '、\n')
        .replace(/どんな暮らしを/g, 'どんな暮らしを\n');
}

export function getStepHint(
    index: number,
    t: (
        k:
            | 'wizard:stepHint1'
            | 'wizard:stepHint2'
            | 'wizard:stepHint3'
            | 'wizard:stepHint4'
            | 'wizard:stepHint5',
    ) => string,
): string {
    if (index === 1) return t('wizard:stepHint2');
    if (index === 2) return t('wizard:stepHint3');
    if (index === 3) return t('wizard:stepHint4');
    if (index === 4) return t('wizard:stepHint5');
    return t('wizard:stepHint1');
}
