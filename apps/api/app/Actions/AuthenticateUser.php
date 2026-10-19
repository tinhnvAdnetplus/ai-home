<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

final class AuthenticateUser
{
    private const DUMMY_HASH = '$2y$12$e0MYzXyjpJS7Pd0RVvHwHeFjM1P6qYkPvZv8E2dM7oVdM4iOmJb12';

    /**
     * Authenticate user credentials and start stateful session.
     */
    public function handle(string $email, string $password, Request $request): User
    {
        $normalizedEmail = strtolower(trim($email));
        $throttleKey = Str::transliterate($normalizedEmail.'|'.(string) $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw new TooManyRequestsHttpException($seconds, 'Too many requests. Please try again later.');
        }

        $user = User::where('email', $normalizedEmail)->first();

        if ($user === null) {
            Hash::check($password, self::DUMMY_HASH);
            RateLimiter::hit($throttleKey, 60);

            throw new AuthenticationException('Unauthenticated.');
        }

        if (! Hash::check($password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            throw new AuthenticationException('Unauthenticated.');
        }

        RateLimiter::clear($throttleKey);
        Auth::guard('web')->login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return $user;
    }
}
