<?php

declare(strict_types=1);

namespace App\Actions;

use App\Config\Wizard\AnswerLogFormatter;
use App\Config\Wizard\AnswerValidator;
use App\Config\Wizard\PublishedWizardResolver;
use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

final class SaveProjectAnswers
{
    /**
     * @param array<string, mixed> $answers
     */
    public function handle(Project $project, array $answers): Project
    {
        $published = PublishedWizardResolver::resolve();
        $result = AnswerValidator::validate($published['payload'], $answers, requireCompleted: false);

        if (!$result->ok) {
            $errors = [];
            foreach ($result->issues as $issue) {
                $path = $issue->getPathString();
                $errors[$path][] = $issue->message;
            }
            throw ValidationException::withMessages($errors);
        }

        $project->answers = $result->data ?? [];
        $project->config_version = $published['version'];
        $project->save();

        Log::info('Người dùng lưu lựa chọn trong wizard dự án', [
            'project_id' => $project->id,
            'user_id' => $project->user_id,
            'config_version' => $published['version'],
            'lua_chon' => AnswerLogFormatter::format($published['payload'], $project->answers),
        ]);

        return $project;
    }
}
