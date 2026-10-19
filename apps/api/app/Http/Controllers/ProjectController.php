<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateProject;
use App\Actions\UpdateProject;
use App\Enums\Role;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\PaginatedCollection;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Support\GuestAccess;
use App\Support\PaginationHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectController extends Controller
{
    /**
     * List projects. Anonymous callers get full access to every project
     * (see App\Support\GuestAccess); logged-in users still see only their own.
     */
    public function index(Request $request): PaginatedCollection
    {
        $user = $request->user();
        $query = $user === null
            ? Project::query()->with('plans')->latest('updated_at')
            : $user->projects()->with('plans')->latest('updated_at');

        if ($request->has('status') && is_string($request->query('status'))) {
            $query->where('status', $request->query('status'));
        }

        $perPage = PaginationHelper::perPage($request, default: 20, max: 50);
        $paginator = $query->paginate($perPage);

        return new PaginatedCollection($paginator);
    }

    /**
     * Create a new draft project. Anonymous callers are attributed to the
     * shared guest account (see App\Support\GuestAccess) so the project still
     * has an owner, but the resource itself is fully open to anyone.
     */
    public function store(StoreProjectRequest $request, CreateProject $action): JsonResponse
    {
        $user = $request->user() ?? GuestAccess::systemUser();

        /** @var array{title: string} $validated */
        $validated = $request->validated();
        $project = $action->handle($user, $validated);

        return (new ProjectResource($project))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Get a specific project.
     *
     * Other users' projects return 404 to prevent resource existence leaks.
     */
    public function show(Request $request, int $id): ProjectResource
    {
        $project = $this->findAuthorizedProject($request, $id);

        return new ProjectResource($project->load('plans'));
    }

    /**
     * Update project metadata (title, status).
     */
    public function update(UpdateProjectRequest $request, int $id, UpdateProject $action): ProjectResource
    {
        $project = $this->findOwnedProject($request, $id);

        /** @var array<string, mixed> $validated */
        $validated = $request->validated();
        $updated = $action->handle($project, $validated);

        return new ProjectResource($updated->load('plans'));
    }

    /**
     * Soft delete a project.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $project = $this->findOwnedProject($request, $id);
        $project->delete();

        return new JsonResponse([
            'message' => 'Project deleted successfully.',
        ], 200);
    }

    /**
     * Find a project readable by the current user, or throw 404.
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
