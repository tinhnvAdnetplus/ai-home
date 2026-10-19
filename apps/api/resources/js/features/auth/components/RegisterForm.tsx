import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { extractErrorMessage } from '@/shared/api';
import { useSession } from '../hooks/useSession';
import { PasswordField } from './PasswordField';

export interface RegisterFormProps {
    readonly onSuccess?: () => void;
}

export function RegisterForm({
    onSuccess,
}: RegisterFormProps): React.JSX.Element {
    const { t } = useTranslation();
    const { register, isRegistering } = useSession();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLocalError(null);

        if (password.length < 10) {
            setLocalError(t('auth:errors.passwordTooShort'));
            return;
        }

        if (password !== passwordConfirmation) {
            setLocalError(t('auth:errors.passwordMismatch'));
            return;
        }

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            onSuccess?.();
        } catch (err: unknown) {
            setLocalError(
                extractErrorMessage(err, t('auth:errors.registrationFailed')),
            );
        }
    };

    return (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {localError ? (
                <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-2xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200/80"
                >
                    <AlertCircle
                        className="h-4 w-4 shrink-0 text-red-500"
                        aria-hidden="true"
                    />
                    <span>{localError}</span>
                </div>
            ) : null}

            <div className="space-y-1.5">
                <Label
                    htmlFor="register-name"
                    className="text-xs font-semibold text-slate-700"
                >
                    {t('auth:name')}
                </Label>
                <div className="relative">
                    <UserIcon
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        aria-hidden="true"
                    />
                    <Input
                        id="register-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        placeholder={t('auth:namePlaceholder')}
                        className="pl-10 h-12 rounded-xl border-slate-300 focus-visible:ring-[#0b6bdc]"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label
                    htmlFor="register-email"
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
                        id="register-email"
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

            <PasswordField
                id="register-password"
                label={t('auth:password')}
                value={password}
                onChange={setPassword}
                placeholder={t('auth:passwordPlaceholder')}
                autoComplete="new-password"
            />

            <PasswordField
                id="register-password-confirm"
                label={t('auth:passwordConfirmation')}
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                placeholder={t('auth:passwordConfirmationPlaceholder')}
                autoComplete="new-password"
            />

            <Button
                type="submit"
                size="lg"
                disabled={isRegistering}
                className="w-full h-12 min-h-[44px] rounded-full bg-[#0b6bdc] hover:bg-[#0958b5] text-white font-bold text-base shadow-md transition-all mt-2"
            >
                <span>
                    {isRegistering
                        ? t('auth:registering')
                        : t('auth:submitRegister')}
                </span>
            </Button>
        </form>
    );
}
