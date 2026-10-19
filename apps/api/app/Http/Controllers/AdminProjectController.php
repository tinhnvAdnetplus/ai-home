<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\PaginatedCollection;
use App\Models\Project;
use App\Support\PaginationHelper;
use Illuminate\Http\Request;

class AdminProjectController extends Controller
{
    /**
     * List all projects across users (admin/editor/architect).
     *
     * Supports filtering by status and user_id, with clamped pagination (max 50).
     */
    public function index(Request $request): PaginatedCollection
    {
        $query = Project::query()->with(['plans', 'user'])->latest('updated_at');

        if ($request->has('status') && is_string($request->query('status'))) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('user_id') && is_numeric($request->query('user_id'))) {
            $query->where('user_id', (int) $request->query('user_id'));
        }

        $perPage = PaginationHelper::perPage($request, default: 20, max: 50);
        $paginator = $query->paginate($perPage);

        return new PaginatedCollection($paginator);
    }
}
