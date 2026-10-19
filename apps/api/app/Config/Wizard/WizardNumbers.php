<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * JavaScript has a single number type, so the TypeScript validator accepts `1.0` where an integer is expected
 * (JSON.parse("1.0") === 1). PHP's json_decode keeps 1.0 as a float; this helper restores the same semantics.
 */
final class WizardNumbers
{
    private const MAX_SAFE_INTEGER = 9007199254740992;

    public static function isIntegral(mixed $value): bool
    {
        if (is_int($value)) {
            return true;
        }

        return is_float($value)
            && is_finite($value)
            && floor($value) === $value
            && abs($value) <= self::MAX_SAFE_INTEGER;
    }
}
