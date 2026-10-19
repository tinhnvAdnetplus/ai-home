<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Project;
use App\Models\User;

final class ProjectPolicy
{
    /**
     * Determine whether the user can view any projects (admin list).
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [Role::ADMIN, Role::EDITOR, Role::ARCHITECT], true);
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        if ($project->user_id === $user->id) {
            return true;
        }

        return in_array($user->role, [Role::ADMIN, Role::EDITOR, Role::ARCHITECT], true);
    }

    /**
     * Determine whether the user can create projects.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        return $project->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->user_id === $user->id;
    }
}
