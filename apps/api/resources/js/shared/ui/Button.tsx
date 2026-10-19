import {
    forwardRef,
    type ButtonHTMLAttributes,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-brand-700 shadow-sm',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
                outline:
                    'border border-border bg-background hover:bg-muted hover:text-foreground',
                secondary: 'bg-muted text-foreground hover:bg-muted/80',
                ghost: 'hover:bg-muted hover:text-foreground',
                link: 'text-primary underline-offset-4 hover:underline min-h-0 min-w-0 p-0',
            },
            size: {
                default: 'px-4 py-2',
                sm: 'px-3 py-1.5 text-xs',
                lg: 'px-8 py-3 text-base',
                icon: 'p-2',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        readonly asChild?: boolean | undefined;
        readonly loading?: boolean | undefined;
        readonly isLoading?: boolean | undefined;
        readonly children?: ReactNode | undefined;
    };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        const {
            className,
            variant,
            size,
            asChild: isAsChild = false,
            loading: isLoadingProp,
            isLoading: isExplicitLoading,
            disabled: isDisabledProp,
            children,
            onClick,
            ...rest
        } = props;

        const isBusy = isLoadingProp ?? isExplicitLoading ?? false;
        const isDisabled = (isDisabledProp ?? false) || isBusy;

        if (isAsChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    aria-busy={isBusy ? 'true' : undefined}
                    aria-disabled={isDisabled ? 'true' : undefined}
                    {...rest}
                >
                    {children}
                </Slot>
            );
        }

        const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
            if (isDisabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            onClick?.(e);
        };

        return (
            <button
                type="button"
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isDisabled}
                aria-busy={isBusy ? 'true' : undefined}
                onClick={handleClick}
                {...rest}
            >
                {isBusy ? (
                    <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                    />
                ) : null}
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';
