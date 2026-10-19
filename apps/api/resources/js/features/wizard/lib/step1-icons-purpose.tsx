import { cn } from '@/shared/lib/cn';
import { type Step1IconProps } from './step1-icons-types';

/** 1. 建築の目的 -> 新しく家を建てる / 2. 住宅の種類 -> 注文住宅 */
export function Step1HouseIcon({
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
            <rect x="33" y="10" width="5" height="10" fill={color} />
            <path
                d="M 24 5 L 4 21 L 8 21 L 8 43 L 40 43 L 40 21 L 44 21 Z"
                fill={color}
            />
            <rect
                x="18"
                y="27"
                width="12"
                height="16"
                rx="1.5"
                fill="#ffffff"
            />
            <rect x="12" y="16" width="7" height="7" rx="1" fill="#ffffff" />
            <rect x="29" y="16" width="7" height="7" rx="1" fill="#ffffff" />
        </svg>
    );
}

/** 1. 建築の目的 -> 現在の家を建て替える */
export function Step1RebuildIcon({
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
            {/* Center solid house */}
            <path
                d="M 24 16 L 16 23 L 18 23 L 18 33 L 30 33 L 30 23 L 32 23 Z"
                fill={color}
            />
            <rect x="22" y="26" width="4" height="7" rx="0.5" fill="#ffffff" />
            {/* Circular arrows */}
            <path
                d="M 14 15 A 17 17 0 0 1 38 17"
                fill="none"
                stroke={color}
                strokeWidth="2.8"
                strokeLinecap="round"
            />
            <polygon points="36,10 42,16 34,18" fill={color} />
            <path
                d="M 34 37 A 17 17 0 0 1 10 33"
                fill="none"
                stroke={color}
                strokeWidth="2.8"
                strokeLinecap="round"
            />
            <polygon points="12,40 6,34 14,32" fill={color} />
        </svg>
    );
}

/** 1. 建築の目的 -> 既存住宅をリフォームする */
export function Step1RenovateIcon({
    className,
    isSelected = false,
}: Step1IconProps): React.JSX.Element {
    const color = isSelected ? '#0b6bdc' : '#7c93a7';
    return (
        <svg
            viewBox="0 0 48 48"
            className={cn('h-11 w-11 shrink-0', className)}
            fill={color}
            aria-hidden="true"
        >
            <path d="M 37.5 7.5 A 8.5 8.5 0 0 0 26.5 15.5 L 12.5 29.5 A 4 4 0 0 0 12.5 35.5 A 4 4 0 0 0 18.5 35.5 L 32.5 21.5 A 8.5 8.5 0 0 0 40.5 10.5 L 35 16 L 32 13 Z" />
        </svg>
    );
}
