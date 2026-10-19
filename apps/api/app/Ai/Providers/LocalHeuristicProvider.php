<?php

declare(strict_types=1);

namespace App\Ai\Providers;

use App\Ai\Dto\LlmRequest;
use App\Ai\Dto\LlmResult;
use App\Ai\Dto\LlmUsage;
use App\Ai\LlmProvider;
use App\Ai\Schema\ConstraintsValidator;

final class LocalHeuristicProvider implements LlmProvider
{
    public function __construct(
        private readonly bool $degraded = false,
    ) {
    }

    public function generateJson(LlmRequest $req): LlmResult
    {
        $startTime = hrtime(true);

        $isLayout = isset($req->jsonSchema['required']) && in_array('gridW', $req->jsonSchema['required'], true);

        $isCommentary = isset($req->jsonSchema['required']) &&
            (in_array('recommendedLabel', $req->jsonSchema['required'], true) || in_array('items', $req->jsonSchema['required'], true)) ||
            str_contains($req->systemPrompt, 'Commentary');

        if ($isLayout) {
            // the local parser cannot design a layout: an empty one makes the caller use the rule-based planner
            $data = ['reasoning' => ['program' => '', 'zoning' => '', 'circulation' => ''], 'gridW' => 0, 'floors' => []];
        } elseif ($isCommentary) {
            $data = $this->generateCommentary($req->userContent);
        } else {
            $data = $this->generateConstraints($req->userContent);
        }

        $latencyMs = (int) round((hrtime(true) - $startTime) / 1e6);

        return new LlmResult(
            data: $data,
            usage: new LlmUsage(0, 0),
            latencyMs: max(1, $latencyMs),
            provider: 'local',
            model: 'local-heuristic-v1',
            source: 'local',
            degraded: $this->degraded,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function generateConstraints(string $userContent): array
    {
        $text = $userContent;

        $hasHiraya = str_contains($text, '平屋') || str_contains($text, 'one_story');
        $hasStorage = str_contains($text, '収納') || str_contains($text, 'クローゼット') || str_contains($text, 'パントリー');
        $hasStudy = str_contains($text, '書斎') || str_contains($text, 'テレワーク') || str_contains($text, '在宅') || str_contains($text, 'ワークスペース');
        $hasPets = str_contains($text, 'ペット') || str_contains($text, '犬') || str_contains($text, '猫');
        $hasBarrierFree = str_contains($text, 'バリアフリー') || str_contains($text, '車椅子');
        $hasSouth = str_contains($text, '南向き') || str_contains($text, '日当たり') || str_contains($text, '採光');
        $hasHousework = str_contains($text, '家事動線') || str_contains($text, '家事') || str_contains($text, '洗濯');
        $hasBudget = str_contains($text, '予算') || str_contains($text, 'コスト') || str_contains($text, '低価格');
        $hasTatami = str_contains($text, '和室') || str_contains($text, '畳') || str_contains($text, 'tatami');

        $priorities = [
            'housework' => $hasHousework ? 5 : 3,
            'storage' => $hasStorage ? 5 : 3,
            'daylight' => $hasSouth ? 5 : 3,
            'budget' => $hasBudget ? 5 : 3,
            'privacy' => 3,
            'family' => 4,
        ];

        $mustHaveRooms = ['ldk', 'bedroom', 'entrance', 'bath', 'wash', 'toilet'];

        if ($hasStorage) {
            $mustHaveRooms[] = 'walkInCloset';
            $mustHaveRooms[] = 'pantry';
        }

        if ($hasHousework) {
            $mustHaveRooms[] = 'laundry';
        }

        if ($hasStudy) {
            $mustHaveRooms[] = 'study';
        }

        if ($hasTatami) {
            $mustHaveRooms[] = 'tatami';
        }

        $mustHaveRooms = array_values(array_unique($mustHaveRooms));

        $roomHints = [];
        if ($hasStudy) {
            $roomHints[] = ['room' => 'study', 'count' => 1, 'sizeJo' => 3.0];
        }
        if ($hasStorage) {
            $roomHints[] = ['room' => 'walkInCloset', 'count' => 1, 'sizeJo' => 3.0];
        }

        $adjacency = [];
        if ($hasHousework) {
            $adjacency[] = ['a' => 'kitchen', 'b' => 'laundry', 'relation' => 'near'];
            $adjacency[] = ['a' => 'laundry', 'b' => 'bath', 'relation' => 'adjacent'];
        }

        $orientation = [
            'livingFacing' => $hasSouth ? 'south' : 'any',
            'entranceSide' => 'any',
        ];

        $accessibility = [
            'oneLevelLiving' => $hasHiraya,
            'wideCorridors' => $hasBarrierFree,
        ];

        $summaryParts = [];
        if ($hasHiraya) {
            $summaryParts[] = '平屋';
        }
        if ($hasStorage) {
            $summaryParts[] = '収納重視';
        }
        if ($hasStudy) {
            $summaryParts[] = '書斎完備';
        }
        if ($hasBudget) {
            $summaryParts[] = '予算バランス最適化';
        }
        if (empty($summaryParts)) {
            $summaryParts[] = '標準的な快適ファミリー住居';
        }

        $summary = implode('・', $summaryParts).'の設計要件です。生活動線と家族の快適性を最優先に計画します。';

        $notes = [];
        if ($hasStorage) {
            $notes[] = '大型パントリーおよびウォークインクローゼットの確保を希望';
        }
        if ($hasStudy) {
            $notes[] = '集中可能な独立書斎スペースの配置を希望';
        }

        $raw = [
            'schemaVersion' => 1,
            'summary' => $summary,
            'priorities' => $priorities,
            'mustHaveRooms' => $mustHaveRooms,
            'avoidRooms' => [],
            'roomHints' => $roomHints,
            'adjacency' => $adjacency,
            'orientation' => $orientation,
            'accessibility' => $accessibility,
            'pets' => $hasPets,
            'workFromHome' => $hasStudy,
            'notes' => $notes,
            'unmappedRequests' => [],
        ];

        return ConstraintsValidator::validateAndSanitize($raw);
    }

    /**
     * @return array{items: list<array{label: string, headline: string, body: string, pros: list<string>, cautions: list<string>}>, recommendedLabel: string}
     */
    private function generateCommentary(string $userContent): array
    {
        // Try decoding input JSON if plans array was passed
        /** @var array<string, mixed>|null $parsed */
        $parsed = json_decode($userContent, true);
        /** @var list<array<string, mixed>> $plans */
        $plans = is_array($parsed) && isset($parsed['plans']) && is_array($parsed['plans'])
            ? $parsed['plans']
            : [];

        if (empty($plans)) {
            // Default 3 proposal commentaries if empty
            $plans = [
                [
                    'label' => 'A',
                    'score' => ['housework' => 85, 'storage' => 80, 'daylight' => 85, 'budget' => 80, 'total' => 83],
                    'summary' => ['floorAreaM2' => 105.0, 'tsubo' => 31.8, 'roomsList' => ['LDK', '主寝室', '洋室1', '洋室2']],
                    'warnings' => [],
                ],
                [
                    'label' => 'B',
                    'score' => ['housework' => 80, 'storage' => 95, 'daylight' => 80, 'budget' => 75, 'total' => 82],
                    'summary' => ['floorAreaM2' => 112.5, 'tsubo' => 34.0, 'roomsList' => ['LDK', '主寝室', '洋室1', '洋室2', 'WIC']],
                    'warnings' => [],
                ],
                [
                    'label' => 'C',
                    'score' => ['housework' => 90, 'storage' => 75, 'daylight' => 75, 'budget' => 92, 'total' => 84],
                    'summary' => ['floorAreaM2' => 96.0, 'tsubo' => 29.0, 'roomsList' => ['LDK', '主寝室', '洋室1', '洋室2']],
                    'warnings' => [],
                ],
            ];
        }

        $items = [];
        $bestLabel = 'A';
        $highestScore = -1.0;

        foreach ($plans as $plan) {
            $label = isset($plan['label']) && is_string($plan['label']) ? $plan['label'] : 'A';
            /** @var array<string, mixed> $score */
            $score = isset($plan['score']) && is_array($plan['score']) ? $plan['score'] : [];
            /** @var array<string, mixed> $summary */
            $summary = isset($plan['summary']) && is_array($plan['summary']) ? $plan['summary'] : [];
            /** @var list<string> $warnings */
            $warnings = isset($plan['warnings']) && is_array($plan['warnings']) ? $plan['warnings'] : [];

            $total = (float) ($score['total'] ?? 80);
            if ($total > $highestScore) {
                $highestScore = $total;
                $bestLabel = $label;
            }

            $tsubo = isset($summary['tsubo']) ? round((float) $summary['tsubo'], 1) : 30.0;
            $areaM2 = isset($summary['floorAreaM2']) ? round((float) $summary['floorAreaM2'], 1) : 99.2;
            $housework = (int) ($score['housework'] ?? 80);
            $storage = (int) ($score['storage'] ?? 80);

            $headline = match ($label) {
                'A' => 'バランスの取れた快適な暮らしを実現する標準プラン',
                'B' => '充実の収納とゆとりある空間を確保したプラン',
                'C' => '予算を抑えつつ機能性を追求した高効率プラン',
                default => "洗練された暮らしを提案するプラン{$label}",
            };

            $body = "延床面積{$tsubo}坪（{$areaM2}m²）の構成で、家事効率スコア{$housework}点、収納スコア{$storage}点を実現。ご家族の快適な生活動線と必要な個室空間を無駄なく整えたプランニングです。";

            $pros = [];
            if ($housework >= 80) {
                $pros[] = '水回りを集約した効率的な家事動線';
            }
            if ($storage >= 80) {
                $pros[] = '各室にゆとりある収納スペースを配置';
            }
            $pros[] = '採光と通風に配慮した明るいリビング設計';
            $pros = array_slice($pros, 0, 3);

            $cautions = [];
            if (! empty($warnings)) {
                $cautions[] = '敷地境界や斜線制限との離隔要確認';
            } else {
                $cautions[] = '外構計画および駐車スペースとの連動検討';
            }
            $cautions = array_slice($cautions, 0, 3);

            $items[] = [
                'label' => mb_substr($label, 0, 10, 'UTF-8'),
                'headline' => mb_substr($headline, 0, 40, 'UTF-8'),
                'body' => mb_substr($body, 0, 300, 'UTF-8'),
                'pros' => $pros,
                'cautions' => $cautions,
            ];
        }

        return [
            'items' => $items,
            'recommendedLabel' => $bestLabel,
        ];
    }
}
