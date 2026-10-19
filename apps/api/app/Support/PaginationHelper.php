<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\Request;

final class PaginationHelper
{
    public const DEFAULT_PER_PAGE = 20;
    public const MIN_PER_PAGE = 1;
    public const MAX_PER_PAGE = 100;
    public const DEFAULT_PAGE = 1;

    public static function page(Request $request): int
    {
        $raw = $request->query('page');
        if ($raw === null || !is_numeric($raw)) {
            return self::DEFAULT_PAGE;
        }

        $val = (int) (float) $raw;

        return max(self::DEFAULT_PAGE, $val);
    }

    public static function perPage(
        Request $request,
        int $default = self::DEFAULT_PER_PAGE,
        int $min = self::MIN_PER_PAGE,
        int $max = self::MAX_PER_PAGE
    ): int {
        $raw = $request->query('per_page');
        if ($raw === null || !is_numeric($raw)) {
            return $default;
        }

        $val = (int) (float) $raw;

        return max($min, min($max, $val));
    }

    /**
     * @return array{page: int, per_page: int}
     */
    public static function paginateParams(Request $request, int $defaultPerPage = self::DEFAULT_PER_PAGE): array
    {
        return [
            'page' => self::page($request),
            'per_page' => self::perPage($request, $defaultPerPage),
        ];
    }
}
