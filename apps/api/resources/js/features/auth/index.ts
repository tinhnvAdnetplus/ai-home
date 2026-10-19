export { LoginPage } from './components/LoginPage';
export { RegisterPage } from './components/RegisterPage';
export { UserMenu } from './components/UserMenu';
export {
    useSession,
    type UseSessionResult,
    AUTH_QUERY_KEY,
} from './hooks/useSession';
export { useRequireAuth } from './hooks/useRequireAuth';
export {
    type User,
    type LoginInput,
    type RegisterInput,
    userSchema,
} from './schemas/auth-schema';
export { fetchCurrentUser, login, register, logout } from './api/auth-api';
