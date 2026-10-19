<?php

declare(strict_types=1);

namespace App\Ai\Schema;

final class ConstraintsValidator
{
    /**
     * Regex matching hostile ASCII/Unicode control characters (except standard newlines/tabs).
     */
    private const CONTROL_CHARS_REGEX = '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u';

    /**
     * Regex matching common prompt injection / jailbreak patterns.
     */
    private const INJECTION_REGEX = '/(\bignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|directions)\b|\bsystem\s+prompt\b|\bjailbreak\b|\bDAN\s+mode\b|指示を無視|前[の同]指示を無視|命令を無視|システムプロンプト|プロンプトを出力)/iu';

    /**
     * Validate, sanitize, clamp, and enforce schema integrity on raw LLM output.
     *
     * @param array<string, mixed> $raw
     * @return array<string, mixed> Strictly validated array matching DesignConstraints schema
     */
    public static function validateAndSanitize(array $raw): array
    {
        $unmappedRequests = [];
        $notes = [];

        // 1. Process unmappedRequests and notes from raw input
        if (isset($raw['unmappedRequests']) && is_array($raw['unmappedRequests'])) {
            foreach ($raw['unmappedRequests'] as $item) {
                if (is_string($item)) {
                    $clean = self::sanitizeString($item, 120);
                    if ($clean !== '') {
                        $unmappedRequests[] = $clean;
                    }
                }
            }
        }

        if (isset($raw['notes']) && is_array($raw['notes'])) {
            foreach ($raw['notes'] as $item) {
                if (is_string($item)) {
                    $clean = self::sanitizeString($item, 80);
                    if ($clean !== '') {
                        $notes[] = $clean;
                    }
                }
            }
        }

        // 2. Summary handling and injection inspection
        $rawSummary = isset($raw['summary']) && is_string($raw['summary']) ? $raw['summary'] : '';
        $summary = self::sanitizeString($rawSummary, 200);

        if (preg_match(self::INJECTION_REGEX, $rawSummary) === 1) {
            // Quarantine hostile injection string into unmappedRequests
            $unmappedRequests[] = mb_substr('検出された特殊要望: '.preg_replace(self::CONTROL_CHARS_REGEX, '', $rawSummary), 0, 120, 'UTF-8');
            $summary = 'ご家族のご要望に応じた快適な住まいづくりを支援する設計要件です。';
        }

        if ($summary === '') {
            $summary = 'お客様のご要望と敷地条件に基づいた基本設計要件です。';
        }

        // 3. Priorities clamping (0..5)
        $rawPriorities = isset($raw['priorities']) && is_array($raw['priorities']) ? $raw['priorities'] : [];
        $priorities = [
            'housework' => self::clampInt($rawPriorities['housework'] ?? 3, 0, 5),
            'storage' => self::clampInt($rawPriorities['storage'] ?? 3, 0, 5),
            'daylight' => self::clampInt($rawPriorities['daylight'] ?? 3, 0, 5),
            'budget' => self::clampInt($rawPriorities['budget'] ?? 3, 0, 5),
            'privacy' => self::clampInt($rawPriorities['privacy'] ?? 3, 0, 5),
            'family' => self::clampInt($rawPriorities['family'] ?? 3, 0, 5),
        ];

        // 4. Room filtering and unrecognized room diversion
        $mustHaveRooms = [];
        if (isset($raw['mustHaveRooms']) && is_array($raw['mustHaveRooms'])) {
            foreach ($raw['mustHaveRooms'] as $room) {
                if (is_string($room)) {
                    $normalized = self::normalizeRoomType($room);
                    if (in_array($normalized, DesignConstraints::ROOM_TYPES, true)) {
                        if (! in_array($normalized, $mustHaveRooms, true)) {
                            $mustHaveRooms[] = $normalized;
                        }
                    } else {
                        $unmappedRequests[] = mb_substr('未定義の希望部屋: '.self::sanitizeString($room, 100), 0, 120, 'UTF-8');
                    }
                }
            }
        }

        $avoidRooms = [];
        if (isset($raw['avoidRooms']) && is_array($raw['avoidRooms'])) {
            foreach ($raw['avoidRooms'] as $room) {
                if (is_string($room)) {
                    $normalized = self::normalizeRoomType($room);
                    if (in_array($normalized, DesignConstraints::ROOM_TYPES, true)) {
                        if (! in_array($normalized, $avoidRooms, true)) {
                            $avoidRooms[] = $normalized;
                        }
                    } else {
                        $unmappedRequests[] = mb_substr('未定義の不要部屋: '.self::sanitizeString($room, 100), 0, 120, 'UTF-8');
                    }
                }
            }
        }

        // 5. Room hints clamping (count: 0..6, sizeJo: 3..40)
        $roomHints = [];
        if (isset($raw['roomHints']) && is_array($raw['roomHints'])) {
            foreach ($raw['roomHints'] as $hint) {
                if (! is_array($hint) || ! isset($hint['room']) || ! is_string($hint['room'])) {
                    continue;
                }
                $normalized = self::normalizeRoomType($hint['room']);
                if (in_array($normalized, DesignConstraints::ROOM_TYPES, true)) {
                    $count = self::clampInt($hint['count'] ?? 1, 0, 6);
                    $sizeJo = self::clampFloat($hint['sizeJo'] ?? 6.0, 3.0, 40.0);
                    $roomHints[] = [
                        'room' => $normalized,
                        'count' => $count,
                        'sizeJo' => $sizeJo,
                    ];
                } else {
                    $unmappedRequests[] = mb_substr('未定義の部屋ヒント: '.self::sanitizeString($hint['room'], 100), 0, 120, 'UTF-8');
                }
            }
        }

        // 6. Adjacency validation (max 8)
        $adjacency = [];
        if (isset($raw['adjacency']) && is_array($raw['adjacency'])) {
            foreach ($raw['adjacency'] as $item) {
                if (count($adjacency) >= 8) {
                    break;
                }
                if (! is_array($item) || ! isset($item['a'], $item['b'])) {
                    continue;
                }
                $a = self::sanitizeString((string) $item['a'], 50);
                $b = self::sanitizeString((string) $item['b'], 50);
                $rel = isset($item['relation']) && is_string($item['relation']) ? strtolower(trim($item['relation'])) : 'near';
                if (! in_array($rel, DesignConstraints::RELATIONS, true)) {
                    $rel = 'near';
                }
                if ($a !== '' && $b !== '') {
                    $adjacency[] = [
                        'a' => $a,
                        'b' => $b,
                        'relation' => $rel,
                    ];
                }
            }
        }

        // 7. Orientation validation
        $rawOrient = isset($raw['orientation']) && is_array($raw['orientation']) ? $raw['orientation'] : [];
        $livingFacing = isset($rawOrient['livingFacing']) && is_string($rawOrient['livingFacing'])
            ? strtolower(trim($rawOrient['livingFacing']))
            : 'any';
        if (! in_array($livingFacing, DesignConstraints::ORIENTATIONS, true)) {
            $livingFacing = 'any';
        }

        $entranceSide = isset($rawOrient['entranceSide']) && is_string($rawOrient['entranceSide'])
            ? strtolower(trim($rawOrient['entranceSide']))
            : 'any';
        if (! in_array($entranceSide, DesignConstraints::ORIENTATIONS, true)) {
            $entranceSide = 'any';
        }

        $orientation = [
            'livingFacing' => $livingFacing,
            'entranceSide' => $entranceSide,
        ];

        // 8. Accessibility
        $rawAccess = isset($raw['accessibility']) && is_array($raw['accessibility']) ? $raw['accessibility'] : [];
        $accessibility = [
            'oneLevelLiving' => (bool) ($rawAccess['oneLevelLiving'] ?? false),
            'wideCorridors' => (bool) ($rawAccess['wideCorridors'] ?? false),
        ];

        // 9. Booleans
        $pets = (bool) ($raw['pets'] ?? false);
        $workFromHome = (bool) ($raw['workFromHome'] ?? false);

        // 10. Cap arrays
        $notes = array_slice(array_values(array_unique($notes)), 0, 6);
        $unmappedRequests = array_slice(array_values(array_unique($unmappedRequests)), 0, 6);

        return [
            'schemaVersion' => 1,
            'summary' => $summary,
            'priorities' => $priorities,
            'mustHaveRooms' => $mustHaveRooms,
            'avoidRooms' => $avoidRooms,
            'roomHints' => $roomHints,
            'adjacency' => $adjacency,
            'orientation' => $orientation,
            'accessibility' => $accessibility,
            'pets' => $pets,
            'workFromHome' => $workFromHome,
            'notes' => $notes,
            'unmappedRequests' => $unmappedRequests,
        ];
    }

    private static function sanitizeString(string $val, int $maxLength): string
    {
        $noControls = (string) preg_replace(self::CONTROL_CHARS_REGEX, '', $val);
        $trimmed = trim($noControls);

        return mb_substr($trimmed, 0, $maxLength, 'UTF-8');
    }

    private static function normalizeRoomType(string $room): string
    {
        $trimmed = strtolower(trim($room));

        // Map common aliases to canonical room types
        return match ($trimmed) {
            'tatami', '和室' => 'tatami',
            'washitsu' => 'washitsu',
            'walkincloset', 'walk_in_closet', 'wic', 'ウォークインクローゼット' => 'walkInCloset',
            'pantry', 'パントリー' => 'pantry',
            'laundry', 'ランドリー', '家事室' => 'laundry',
            'study', '書斎', 'ワークスペース' => 'study',
            'child_room', 'childroom', '子供部屋' => 'childRoom',
            'bedroom', '主寝室', '寝室' => 'bedroom',
            'ldk' => 'ldk',
            'living', 'リビング' => 'living',
            'dining', 'ダイニング' => 'dining',
            'kitchen', 'キッチン' => 'kitchen',
            'bath', '浴室', 'お風呂' => 'bath',
            'wash', '洗面', '洗面室', '洗面所' => 'wash',
            'toilet', 'トイレ' => 'toilet',
            'entrance', '玄関' => 'entrance',
            'storage', '収納', '納戸' => 'storage',
            'closet', 'クローゼット' => 'closet',
            'balcony', 'バルコニー', 'ベランダ' => 'balcony',
            'void', '吹き抜け', '吹抜' => 'void',
            default => $trimmed,
        };
    }

    private static function clampInt(mixed $val, int $min, int $max): int
    {
        $num = is_numeric($val) ? (int) $val : $min;

        return max($min, min($max, $num));
    }

    private static function clampFloat(mixed $val, float $min, float $max): float
    {
        $num = is_numeric($val) ? (float) $val : $min;

        return round(max($min, min($max, $num)), 1);
    }
}
