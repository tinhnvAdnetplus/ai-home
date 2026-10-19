import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import type { LoginInput } from '../schemas/auth-schema';

type LoginFormProps = {
    readonly onSubmit: (data: LoginInput) => void;
    readonly isSubmitting: boolean;
};

export function LoginForm({
    onSubmit,
    isSubmitting,
}: LoginFormProps): React.JSX.Element {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label
                    htmlFor="login-email"
                    className="text-xs font-semibold text-slate-700"
                >
                    {t('auth:email')}
                </Label>
                <div className="relative">
                    <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        aria-hidden="true"
                    />
                    <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        placeholder={t('auth:emailPlaceholder')}
                        className="pl-10 h-12 rounded-xl border-slate-300 focus-visible:ring-[#0b6bdc]"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-slate-700"
                >
                    {t('auth:password')}
                </Label>
                <div className="relative">
                    <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        aria-hidden="true"
                    />
                    <Input
                        id="login-password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                        placeholder={t('auth:passwordPlaceholder')}
                        className="pl-10 pr-10 h-12 rounded-xl border-slate-300 focus-visible:ring-[#0b6bdc]"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setIsPasswordVisible((isVisible) => !isVisible);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center p-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={
                            isPasswordVisible
                                ? t('auth:hidePassword')
                                : t('auth:showPassword')
                        }
                    >
                        {isPasswordVisible ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-12 min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-bold text-base shadow-md transition-all mt-2"
            >
                <span>
                    {isSubmitting ? t('auth:loggingIn') : t('auth:submitLogin')}
                </span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
        </form>
    );
}
