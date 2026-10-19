<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\StoreProjectPlans;
use App\Enums\Role;
use App\Http\Requests\StoreProjectPlansRequest;
use App\Http\Resources\ProjectPlanResource;
use App\Models\Project;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectPlanController extends Controller
{
    public const MAX_BODY_SIZE_BYTES = 2097152; // 2 MB

    /**
     * List all plans belonging to a project.
     */
    public function index(Request $request, int $id): AnonymousResourceCollection
    {
        $project = $this->findAuthorizedProject($request, $id);

        return ProjectPlanResource::collection($project->plans()->latest()->get());
    }

    /**
     * Upload up to 3 generated plans for a project.
     */
    public function store(StoreProjectPlansRequest $request, int $id, StoreProjectPlans $action): JsonResponse
    {
        $project = $this->findOwnedProject($request, $id);

        $rawContent = $request->getContent();
        if (strlen($rawContent) > self::MAX_BODY_SIZE_BYTES) {
            throw new PostTooLargeException();
        }

        $body = json_decode($rawContent, true);
        if (!is_array($body)) {
            $body = $request->all();
        }

        /** @var list<mixed> $plansData */
        $plansData = [];
        if (isset($body['plans']) && is_array($body['plans'])) {
            $plansData = $body['plans'];
        } elseif (array_is_list($body)) {
            $plansData = $body;
        } elseif (isset($body['label']) || isset($body['model'])) {
            $plansData = [$body];
        }

        $created = $action->handle($project, $plansData);

        return (ProjectPlanResource::collection($created))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Delete a specific plan from a project.
     */
    public function destroy(Request $request, int $id, int $planId): JsonResponse
    {
        $project = $this->findOwnedProject($request, $id);

        $plan = $project->plans()->find($planId);
        if ($plan === null) {
            throw new NotFoundHttpException('Plan not found.');
        }

        $plan->delete();

        return new JsonResponse([
            'message' => 'Plan deleted successfully.',
        ], 200);
    }

    /**
     * Find a project viewable by the current user, or throw 404.
     *
     * Anonymous callers (no authenticated user) get full access to any
     * project by design — see App\Support\GuestAccess.
     */
    private function findAuthorizedProject(Request $request, int $id): Project
    {
        $project = Project::find($id);
        if ($project === null) {
            throw new NotFoundHttpException('The requested resource was not found.');
        }

        $user = $request->user();
        if ($user === null) {
            return $project;
        }

        $canView = $project->user_id === $user->id
            || in_array($user->role, [Role::ADMIN, Role::EDITOR, Role::ARCHITECT], true);

        if (!$canView) {
            throw new NotFoundHttpException('The requested resource was not found.');
        }

        return $project;
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
