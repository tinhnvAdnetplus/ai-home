<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\AuthenticateUser;
use App\Actions\LogoutUser;
use App\Actions\RegisterUser;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Register a new user account.
     */
    public function register(RegisterRequest $request, RegisterUser $action): JsonResponse
    {
        /** @var array{name: string, email: string, password: string} $validated */
        $validated = $request->validated();
        $user = $action->handle($validated);

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    /**
     * Authenticate and start a stateful session.
     */
    public function login(LoginRequest $request, AuthenticateUser $action): JsonResponse
    {
        $user = $action->handle(
            (string) $request->input('email'),
            (string) $request->input('password'),
            $request
        );

        return (new UserResource($user))->response();
    }

    /**
     * Log out and invalidate the current session.
     */
    public function logout(Request $request, LogoutUser $action): JsonResponse
    {
        $action->handle($request);

        return new JsonResponse(['message' => 'Logged out successfully']);
    }

    /**
     * Retrieve the currently authenticated user with resolved abilities.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            throw new AuthenticationException('Unauthenticated.');
        }

        return (new UserResource($user))->response();
    }
}
