<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\Wizard\PublishedWizardResolver;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;

final class CreateProject
{
    /**
     * @param array{title: string} $data
     */
    public function handle(User $user, array $data): Project
    {
        $published = PublishedWizardResolver::resolve();

        $project = new Project();
        $project->user_id = $user->id;
        $project->title = $data['title'];
        $project->status = ProjectStatus::Draft;
        $project->config_version = $published['version'];
        $project->answers = [];
        $project->save();

        return $project;
    }
}
