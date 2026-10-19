import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/shared/ui/Label';
import { Input } from '@/shared/ui/Input';

export interface PasswordFieldProps {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder?: string | undefined;
    readonly autoComplete?: string | undefined;
    readonly isRequired?: boolean | undefined;
}

export function PasswordField({
    id,
    label,
    value,
    onChange,
    placeholder,
    autoComplete = 'current-password',
    isRequired = true,
}: PasswordFieldProps): React.JSX.Element {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="space-y-1.5">
            <Label
                htmlFor={id}
                className="text-xs font-semibold text-slate-700"
            >
                {label}
            </Label>
            <div className="relative">
                <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                />
                <Input
                    id={id}
                    type={isVisible ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    required={isRequired}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    placeholder={placeholder}
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-300 focus-visible:ring-[#0b6bdc]"
                />
                <button
                    type="button"
                    onClick={() => {
                        setIsVisible((isCurrent) => !isCurrent);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center p-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={
                        isVisible
                            ? t('auth:hidePassword')
                            : t('auth:showPassword')
                    }
                >
                    {isVisible ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                </button>
            </div>
        </div>
    );
}
