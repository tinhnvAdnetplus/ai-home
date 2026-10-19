<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class RequestId
{
    public const HEADER = 'X-Request-Id';
    public const ATTRIBUTE = 'request_id';
    public const PATTERN = '/^[A-Za-z0-9._-]{8,64}\z/';

    public static function isValid(mixed $id): bool
    {
        return is_string($id) && preg_match(self::PATTERN, $id) === 1;
    }

    public static function resolve(Request $request): string
    {
        if ($request->attributes->has(self::ATTRIBUTE)) {
            $existing = $request->attributes->get(self::ATTRIBUTE);
            if (is_string($existing) && self::isValid($existing)) {
                return $existing;
            }
        }

        $header = $request->header(self::HEADER);
        $id = self::isValid($header) ? (string) $header : (string) Str::uuid();

        $request->attributes->set(self::ATTRIBUTE, $id);

        return $id;
    }
}
