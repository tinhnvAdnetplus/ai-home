<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DevUserSeeder
 *
 * Populates local development database with standard accounts for each role.
 * Only executes in the 'local' environment; no-op in production or staging.
 *
 * Credentials for all seeded accounts:
 * Password: Password1234!
 *
 * - Admin:     admin@aihome.local
 * - Editor:    editor@aihome.local
 * - Architect: architect@aihome.local
 * - User:      user@aihome.local
 */
class DevUserSeeder extends Seeder
{
    public const DEFAULT_PASSWORD = 'Password1234!';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment('local')) {
            return;
        }

        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@aihome.local',
                'role' => Role::ADMIN,
            ],
            [
                'name' => 'Editor User',
                'email' => 'editor@aihome.local',
                'role' => Role::EDITOR,
            ],
            [
                'name' => 'Architect User',
                'email' => 'architect@aihome.local',
                'role' => Role::ARCHITECT,
            ],
            [
                'name' => 'Standard User',
                'email' => 'user@aihome.local',
                'role' => Role::USER,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrNew(['email' => $userData['email']]);
            $user->forceFill([
                'name' => $userData['name'],
                'password' => Hash::make(self::DEFAULT_PASSWORD),
                'role' => $userData['role'],
                'email_verified_at' => now(),
            ])->save();
        }
    }
}
