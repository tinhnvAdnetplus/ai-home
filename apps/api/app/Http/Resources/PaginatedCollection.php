<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PaginatedCollection extends ResourceCollection
{
    /**
     * The "data" wrapper that should be applied.
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * Transform the resource collection into an array.
     *
     * @return array{data: mixed, meta: array{page: int, per_page: int, total: int, last_page: int}}
     */
    public function toArray(Request $request): array
    {
        $paginator = $this->resource;

        if ($paginator instanceof LengthAwarePaginator) {
            return [
                'data' => $this->collection,
                'meta' => [
                    'page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ];
        }

        $count = count($this->collection);

        return [
            'data' => $this->collection,
            'meta' => [
                'page' => 1,
                'per_page' => $count > 0 ? $count : PaginationHelper::DEFAULT_PER_PAGE,
                'total' => $count,
                'last_page' => 1,
            ],
        ];
    }

    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function toResponse($request): JsonResponse
    {
        return new JsonResponse(
            $this->toArray($request),
            200,
            [],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    public static function page(Request $request): int
    {
        return PaginationHelper::page($request);
    }

    public static function perPage(
        Request $request,
        int $default = PaginationHelper::DEFAULT_PER_PAGE,
        int $min = PaginationHelper::MIN_PER_PAGE,
        int $max = PaginationHelper::MAX_PER_PAGE
    ): int {
        return PaginationHelper::perPage($request, $default, $min, $max);
    }

    /**
     * @return array{page: int, per_page: int}
     */
    public static function paginateParams(
        Request $request,
        int $defaultPerPage = PaginationHelper::DEFAULT_PER_PAGE
    ): array {
        return PaginationHelper::paginateParams($request, $defaultPerPage);
    }
}
