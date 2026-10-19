<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Lets the /v1/projects endpoints work for anonymous (non-logged-in) callers.
 *
 * Project rows still need an owning user_id (NOT NULL FK), so unauthenticated
 * writes are attributed to a single shared system account. Unauthenticated
 * reads/writes are granted full access across all projects regardless of
 * actual ownership — see findOwnedProject()/findAuthorizedProject() in the
 * Project* controllers, which skip the ownership check when request()->user()
 * is null.
 */
final class GuestAccess
{
    private const EMAIL = 'guest@system.local';

    public static function systemUser(): User
    {
        /** @var User */
        return User::firstOrCreate(
            ['email' => self::EMAIL],
            [
                'name' => 'Guest',
                'password' => Hash::make(Str::random(40)),
                'role' => Role::USER->value,
            ],
        );
    }
}
