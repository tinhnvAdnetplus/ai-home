import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (props, ref) => {
        const { className, disabled: isDisabled, ...rest } = props;

        return (
            <textarea
                className={cn(
                    'flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-[16px] sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
                    className,
                )}
                ref={ref}
                disabled={isDisabled}
                {...rest}
            />
        );
    },
);

Textarea.displayName = 'Textarea';
