import { cn } from '@/shared/lib/cn';
import { type Step1IconProps } from './step1-icons-types';

/** 3. 希望する階数 -> 3階建て */
export function Step1ThreeStoryIcon({
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
                d="M 24 3 L 8 16 L 11 16 L 11 44 L 37 44 L 37 16 L 40 16 Z"
                fill={color}
            />
            <rect x="15" y="12" width="6" height="5" rx="0.5" fill="#ffffff" />
            <rect x="27" y="12" width="6" height="5" rx="0.5" fill="#ffffff" />
            <rect x="15" y="21" width="6" height="5" rx="0.5" fill="#ffffff" />
            <rect x="27" y="21" width="6" height="5" rx="0.5" fill="#ffffff" />
            <rect x="15" y="30" width="6" height="5" rx="0.5" fill="#ffffff" />
            <rect x="27" y="29" width="6" height="15" rx="0.5" fill="#ffffff" />
        </svg>
    );
}

/** 3. 希望する階数 -> 相談したい */
export function Step1ConsultIcon({
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
                d="M 24 9 C 13.5 9 5 16.5 5 25.5 C 5 29.8 7.2 33.7 10.8 36.5 L 9 43 L 16.5 40.2 C 18.8 41.3 21.3 42 24 42 C 34.5 42 43 34.5 43 25.5 C 43 16.5 34.5 9 24 9 Z"
                fill={color}
            />
            <circle cx="16.5" cy="25.5" r="2.2" fill="#ffffff" />
            <circle cx="24" cy="25.5" r="2.2" fill="#ffffff" />
            <circle cx="31.5" cy="25.5" r="2.2" fill="#ffffff" />
        </svg>
    );
}
