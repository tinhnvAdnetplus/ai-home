<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\Wizard\AnswerLogFormatter;
use App\Config\Wizard\AnswerValidator;
use App\Config\Wizard\PublishedWizardResolver;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

final class SubmitProject
{
    /**
     * @param array<string, mixed>|null $answers
     */
    public function handle(Project $project, ?array $answers = null): Project
    {
        $published = PublishedWizardResolver::resolve();
        $answersToValidate = $answers ?? ($project->answers ?? []);

        $result = AnswerValidator::validate($published['payload'], $answersToValidate, requireCompleted: true);

        if (!$result->ok) {
            $errors = [];
            foreach ($result->issues as $issue) {
                $path = $issue->getPathString();
                $errors[$path][] = $issue->message;
            }
            throw ValidationException::withMessages($errors);
        }

        $project->answers = $result->data ?? [];
        $project->status = ProjectStatus::Submitted;
        $project->config_version = $published['version'];
        $project->save();

        Log::info('Người dùng gửi (submit) toàn bộ lựa chọn của dự án', [
            'project_id' => $project->id,
            'user_id' => $project->user_id,
            'config_version' => $published['version'],
            'lua_chon' => AnswerLogFormatter::format($published['payload'], $project->answers),
        ]);

        return $project;
    }
}
