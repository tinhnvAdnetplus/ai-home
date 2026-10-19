<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\SaveProjectAnswers;
use App\Actions\SubmitProject;
use App\Enums\Role;
use App\Http\Requests\SaveAnswersRequest;
use App\Http\Requests\SubmitProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectAnswersController extends Controller
{
    /**
     * Save draft wizard answers for a project.
     *
     * Validates types and ranges, prunes invalid/stale/disabled answers,
     * but permits incomplete/missing required fields.
     */
    public function update(SaveAnswersRequest $request, int $id, SaveProjectAnswers $action): ProjectResource
    {
        $project = $this->findOwnedProject($request, $id);

        /** @var array<string, mixed> $answers */
        $answers = $request->input('answers');
        $updated = $action->handle($project, $answers);

        return new ProjectResource($updated->load('plans'));
    }

    /**
     * Submit completed wizard answers for a project.
     *
     * Enforces that all visible, non-disabled required fields are completed.
     * Advances project status to 'submitted' and locks in current config_version.
     */
    public function submit(SubmitProjectRequest $request, int $id, SubmitProject $action): ProjectResource
    {
        $project = $this->findOwnedProject($request, $id);

        /** @var array<string, mixed>|null $answers */
        $answers = $request->has('answers') ? $request->input('answers') : null;
        $updated = $action->handle($project, $answers);

        return new ProjectResource($updated->load('plans'));
    }

    /**
     * Find a project the current user may mutate, or throw 404.
     *
     * Anonymous callers (no authenticated user) get full access to any
     * project by design — see App\Support\GuestAccess.
     */
    private function findOwnedProject(Request $request, int $id): Project
    {
        $project = Project::find($id);
        if ($project === null) {
            throw new NotFoundHttpException('The requested resource was not found.');
        }

        $user = $request->user();
        if ($user === null) {
            return $project;
        }

        $canMutate = $project->user_id === $user->id || $user->role === Role::ADMIN;
        if (!$canMutate) {
            throw new NotFoundHttpException('The requested resource was not found.');
        }

        return $project;
    }
}
