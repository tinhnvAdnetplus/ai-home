import {
    cloneElement,
    forwardRef,
    useId,
    type ReactElement,
    type ReactNode,
} from 'react';
import { cn } from '@/shared/lib/cn';
import { Label } from './Label';

export type FormFieldControlProps = {
    readonly id: string;
    readonly 'aria-describedby'?: string | undefined;
    readonly 'aria-invalid'?: boolean | undefined;
};

export type FormFieldProps = {
    readonly id?: string | undefined;
    readonly label: ReactNode;
    readonly hint?: ReactNode | undefined;
    readonly error?: ReactNode | undefined;
    readonly required?: boolean | undefined;
    readonly className?: string | undefined;
    readonly children:
        | ReactElement<FormFieldControlProps>
        | ((props: FormFieldControlProps) => ReactNode);
};

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    (props, ref) => {
        const {
            id: customId,
            label,
            hint,
            error,
            required: isRequired,
            className,
            children,
        } = props;

        const generatedId = useId();
        const id = customId ?? generatedId;
        const hintId = hint ? `${id}-hint` : undefined;
        const errorId = error ? `${id}-error` : undefined;

        const describedByList: string[] = [];
        if (hintId) {
            describedByList.push(hintId);
        }
        if (errorId) {
            describedByList.push(errorId);
        }
        const describedBy =
            describedByList.length > 0 ? describedByList.join(' ') : undefined;

        const isInvalid = Boolean(error);

        const controlProps: FormFieldControlProps = {
            id,
            'aria-describedby': describedBy,
            'aria-invalid': isInvalid,
        };

        const renderControl = (): ReactNode => {
            if (typeof children === 'function') {
                return children(controlProps);
            }
            return cloneElement(children, controlProps);
        };

        return (
            <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
                <Label htmlFor={id} className="flex items-center gap-1">
                    {label}
                    {isRequired ? (
                        <span
                            className="text-destructive font-bold"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    ) : null}
                </Label>
                {renderControl()}
                {hint && !error ? (
                    <p id={hintId} className="text-xs text-muted-foreground">
                        {hint}
                    </p>
                ) : null}
                {error ? (
                    <p
                        id={errorId}
                        role="alert"
                        className="text-xs font-medium text-destructive"
                    >
                        {error}
                    </p>
                ) : null}
            </div>
        );
    },
);

FormField.displayName = 'FormField';
