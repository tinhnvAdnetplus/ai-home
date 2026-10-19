<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ProjectStatus;
use App\Models\Project;

final class UpdateProject
{
    /**
     * @param array<string, mixed> $data
     */
    public function handle(Project $project, array $data): Project
    {
        if (isset($data['title'])) {
            $project->title = (string) $data['title'];
        }

        if (isset($data['status'])) {
            $project->status = ProjectStatus::from((string) $data['status']);
        }

        $project->save();

        return $project;
    }
}
