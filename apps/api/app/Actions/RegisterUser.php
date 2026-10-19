<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

final class RegisterUser
{
    /**
     * Register a new user with default 'user' role.
     *
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function handle(array $data): User
    {
        $user = new User();
        $user->name = $data['name'];
        $user->email = strtolower(trim($data['email']));
        $user->password = Hash::make($data['password']);
        $user->role = Role::USER;
        $user->save();

        return $user;
    }
}
