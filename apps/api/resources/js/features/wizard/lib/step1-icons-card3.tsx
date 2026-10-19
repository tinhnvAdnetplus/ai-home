import { cn } from '@/shared/lib/cn';
import { type Step1IconProps } from './step1-icons-types';

export {
    Step1ThreeStoryIcon,
    Step1ConsultIcon,
} from './step1-icons-card3-more';

/** 3. 希望する階数 -> 平屋 */
export function Step1OneStoryIcon({
    className,
    isSelected = false,
}: Step1IconProps): React.JSX.Element {
    const color = isSelected ? '#0b6bdc' : '#7c93a7';
    return (
        <svg
            viewBox="0 0 48 48"
            className={cn('h-11 w-11 shrink-0', className)}
            aria-hidden="true"
        >
            <path
                d="M 24 10 L 4 23 L 7 23 L 7 42 L 41 42 L 41 23 L 44 23 Z"
                fill={color}
            />
            <rect x="11" y="27" width="7" height="11" fill="#ffffff" />
            <rect x="21" y="27" width="7" height="15" fill="#ffffff" />
            <rect x="30" y="27" width="7" height="11" fill="#ffffff" />
        </svg>
    );
}

/** 3. 希望する階数 -> 2階建て */
export function Step1TwoStoryIcon({
    className,
    isSelected = false,
}: Step1IconProps): React.JSX.Element {
    const color = isSelected ? '#0b6bdc' : '#7c93a7';
    return (
        <svg
            viewBox="0 0 48 48"
            className={cn('h-11 w-11 shrink-0', className)}
            aria-hidden="true"
        >
            <path
                d="M 24 5 L 6 19 L 9 19 L 9 43 L 39 43 L 39 19 L 42 19 Z"
                fill={color}
            />
            <rect x="14" y="16" width="7" height="7" rx="1" fill="#ffffff" />
            <rect x="27" y="16" width="7" height="7" rx="1" fill="#ffffff" />
            <rect x="14" y="29" width="7" height="7" rx="1" fill="#ffffff" />
            <rect x="27" y="28" width="8" height="15" rx="1" fill="#ffffff" />
        </svg>
    );
}
