import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { className, type = 'text', disabled: isDisabled, ...rest } = props;

    return (
        <input
            type={type}
            className={cn(
                'flex h-11 min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-[16px] sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
                className,
            )}
            ref={ref}
            disabled={isDisabled}
            {...rest}
        />
    );
});

Input.displayName = 'Input';
