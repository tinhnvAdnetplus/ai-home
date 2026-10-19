<?php

declare(strict_types=1);

namespace App\Support;

final class Ability
{
    public const MANAGE_CONFIG = 'manage-config';
    public const MANAGE_USERS = 'manage-users';
    public const REVIEW_PLANS = 'review-plans';
    public const OWN_PLANS = 'own-plans';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::MANAGE_CONFIG,
            self::MANAGE_USERS,
            self::REVIEW_PLANS,
            self::OWN_PLANS,
        ];
    }
}
