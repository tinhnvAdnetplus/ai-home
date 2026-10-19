<?php

declare(strict_types=1);

namespace App\Reports;

use App\Config\Wizard\AnswerResolver;
use App\Config\Wizard\PublishedWizardResolver;
use App\Models\ConfigVersion;
use App\Models\Project;
use App\Models\ProjectPlan;

final class ProposalDataBuilder
{
    /**
     * Build all view data required for the proposal booklet.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function build(Project $project, array $data): array
    {
        $locale = is_string($data['locale'] ?? null) ? (string) $data['locale'] : 'ja';
        $planLabel = is_string($data['planLabel'] ?? null) ? (string) $data['planLabel'] : null;
        $images = is_array($data['images'] ?? null) ? $data['images'] : [];
        $rawCommentary = is_array($data['commentary'] ?? null) ? $data['commentary'] : [];

        $wizard = $this->resolveWizardConfig($project);
        $answers = is_array($project->answers) ? $project->answers : [];

        $plan = $this->resolvePlan($project, $planLabel);
        $planData = $this->extractPlanData($plan, $answers, $locale);
        $requirements = $this->buildRequirements($wizard, $answers, $locale);
        $summary = $this->extractSummary($requirements, $answers);
        $commentary = $this->buildCommentary($rawCommentary);

        return [
            'locale' => $locale,
            'project' => $project,
            'generatedDate' => date('Y年m月d日'),
            'summary' => $summary,
            'requirements' => $requirements,
            'planData' => $planData,
            'images' => $images,
            'commentary' => $commentary,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveWizardConfig(Project $project): array
    {
        if ($project->config_version !== null) {
            $ver = ConfigVersion::whereHas('document', fn ($q) => $q->where('key', 'wizard'))
                ->where('version', $project->config_version)
                ->first();
            if ($ver !== null) {
                return $ver->payload;
            }
        }

        return PublishedWizardResolver::resolve()['payload'];
    }

    private function resolvePlan(Project $project, ?string $planLabel): ?ProjectPlan
    {
        if ($planLabel !== null) {
            $matched = $project->plans->first(fn (ProjectPlan $p): bool => $p->label === $planLabel);
            if ($matched !== null) {
                return $matched;
            }
        }

        return $project->plans->first();
    }

    /**
     * @param array<string, mixed> $wizard
     * @param array<string, mixed> $answers
     * @return list<array{key: string, label: string, value: string, section: string}>
     */
    private function buildRequirements(array $wizard, array $answers, string $locale): array
    {
        $resolved = AnswerResolver::resolveWizardState($wizard, $answers);
        $visible = $resolved['visible'];
        $steps = is_array($wizard['steps'] ?? null) ? $wizard['steps'] : [];
        $out = [];

        foreach ($steps as $step) {
            if (!is_array($step)) {
                continue;
            }
            foreach ($step['sections'] ?? [] as $sec) {
                if (!is_array($sec)) {
                    continue;
                }
                $secTitle = $this->pickLocaleString($sec['title'] ?? null, $locale, '');
                foreach ($sec['fields'] ?? [] as $field) {
                    if (!is_array($field) || !isset($field['key']) || !is_string($field['key'])) {
                        continue;
                    }
                    $k = $field['key'];
                    if (!($visible[$k] ?? true)) {
                        continue;
                    }
                    if (!array_key_exists($k, $answers) || AnswerResolver::isAnswerEmpty($field, $answers[$k])) {
                        continue;
                    }

                    $label = $this->pickLocaleString($field['label'] ?? null, $locale, $k);
                    $valStr = $this->formatAnswerValue($answers[$k], $field, $locale);
                    $out[] = [
                        'key' => $k,
                        'label' => $label,
                        'value' => $valStr,
                        'section' => $secTitle,
                    ];
                }
            }
        }

        return $out;
    }

    /**
     * @param array<string, mixed> $field
     */
    private function formatAnswerValue(mixed $val, array $field, string $locale): string
    {
        if (is_array($field['options'] ?? null)) {
            $optMap = [];
            foreach ($field['options'] as $opt) {
                if (is_array($opt) && isset($opt['value'])) {
                    $optVal = (string) $opt['value'];
                    $optMap[$optVal] = $this->pickLocaleString($opt['label'] ?? null, $locale, $optVal);
                }
            }
            if (is_array($val)) {
                $labels = array_map(fn ($item): string => $optMap[(string) $item] ?? (string) $item, $val);

                return implode('、', $labels);
            }
            if (isset($optMap[(string) $val])) {
                return $optMap[(string) $val];
            }
        }

        if (is_bool($val)) {
            return match ($locale) {
                'en' => $val ? 'Yes' : 'No',
                'vi' => $val ? 'Có' : 'Không',
                default => $val ? 'はい' : 'いいえ',
            };
        }

        if (is_array($val)) {
            return implode(', ', array_map(fn ($v): string => is_scalar($v) ? (string) $v : '', $val));
        }

        return is_scalar($val) ? (string) $val : '';
    }

    /**
     * @param array<string, mixed> $answers
     * @return array<string, mixed>
     */
    private function extractPlanData(?ProjectPlan $plan, array $answers, string $locale): array
    {
        $model = is_array($plan?->model) ? $plan->model : [];
        $rawScores = is_array($plan?->score) ? $plan->score : [];

        $totalAreaM2 = $this->calculateAreaM2($model, $answers);
        $totalAreaTsubo = $totalAreaM2 * 0.3025;
        $buildingAreaM2 = $totalAreaM2 * 0.6;
        $buildingAreaTsubo = $buildingAreaM2 * 0.3025;

        $rooms = $this->extractRooms($model);
        $scores = $this->formatScores($rawScores);
        $warnings = is_array($model['warnings'] ?? null) ? $model['warnings'] : [];

        return [
            'label' => $plan !== null ? $plan->label : '標準提案プラン',
            'totalFloorAreaM2' => $totalAreaM2,
            'totalFloorAreaTsubo' => $totalAreaTsubo,
            'buildingAreaM2' => $buildingAreaM2,
            'buildingAreaTsubo' => $buildingAreaTsubo,
            'bcr' => $model['buildingCoverageRatio'] ?? null,
            'far' => $model['floorAreaRatio'] ?? null,
            'scores' => $scores,
            'rooms' => $rooms,
            'warnings' => $warnings,
        ];
    }

    /**
     * @param array<string, mixed> $model
     * @param array<string, mixed> $answers
     */
    private function calculateAreaM2(array $model, array $answers): float
    {
        if (isset($model['totalFloorAreaM2']) && is_numeric($model['totalFloorAreaM2'])) {
            return (float) $model['totalFloorAreaM2'];
        }

        if (is_array($model['floors'] ?? null)) {
            $sum = 0.0;
            foreach ($model['floors'] as $f) {
                if (is_array($f) && is_array($f['rooms'] ?? null)) {
                    foreach ($f['rooms'] as $r) {
                        $sum += (float) ($r['areaM2'] ?? 0);
                    }
                }
            }
            if ($sum > 0) {
                return $sum;
            }
        }

        $targetTsubo = $answers['plan_target_area'] ?? $answers['desired_area'] ?? 32;

        return is_numeric($targetTsubo) ? ((float) $targetTsubo) * 3.30578 : 105.8;
    }

    /**
     * @param array<string, mixed> $model
     * @return list<array{floor: string, name: string, areaM2: float, jo: float}>
     */
    private function extractRooms(array $model): array
    {
        $rooms = [];
        if (is_array($model['floors'] ?? null)) {
            foreach ($model['floors'] as $f) {
                $lvl = isset($f['level']) ? "{$f['level']}F" : '1F';
                foreach ($f['rooms'] ?? [] as $r) {
                    $m2 = (float) ($r['areaM2'] ?? 0);
                    $rooms[] = [
                        'floor' => $lvl,
                        'name' => (string) ($r['name'] ?? $r['type'] ?? '居室'),
                        'areaM2' => $m2,
                        'jo' => round($m2 / 1.62, 1),
                    ];
                }
            }
        } elseif (is_array($model['rooms'] ?? null)) {
            foreach ($model['rooms'] as $idx => $r) {
                $name = is_string($r) ? $r : (string) ($r['name'] ?? '居室');
                $m2 = 16.5;
                $rooms[] = [
                    'floor' => $idx > 2 ? '2F' : '1F',
                    'name' => $name,
                    'areaM2' => $m2,
                    'jo' => round($m2 / 1.62, 1),
                ];
            }
        }

        if (empty($rooms)) {
            $rooms = [
                ['floor' => '1F', 'name' => 'LDK (リビング・ダイニング・キッチン)', 'areaM2' => 33.1, 'jo' => 20.4],
                ['floor' => '1F', 'name' => '和室・小上がり', 'areaM2' => 7.4, 'jo' => 4.5],
                ['floor' => '1F', 'name' => '玄関・シューズクローク', 'areaM2' => 6.2, 'jo' => 3.8],
                ['floor' => '1F', 'name' => '洗面脱衣室・浴室', 'areaM2' => 6.6, 'jo' => 4.1],
                ['floor' => '2F', 'name' => '主寝室 (WIC付)', 'areaM2' => 14.8, 'jo' => 9.1],
                ['floor' => '2F', 'name' => '洋室1 (子供部屋)', 'areaM2' => 9.9, 'jo' => 6.1],
                ['floor' => '2F', 'name' => '洋室2 (子供部屋)', 'areaM2' => 9.9, 'jo' => 6.1],
                ['floor' => '2F', 'name' => '書斎・ワークスペース', 'areaM2' => 4.9, 'jo' => 3.0],
            ];
        }

        return $rooms;
    }

    /**
     * @param array<string, mixed> $rawScores
     * @return array<string, array{label: string, raw: int, percent: int}>
     */
    private function formatScores(array $rawScores): array
    {
        $labelMap = [
            'comfort' => '快適性・居住感',
            'cost' => 'コスト効率',
            'flow' => '家事動線・使い勝手',
            'light' => '採光・通風性能',
            'storage' => '収納充実度',
        ];

        $scores = [];
        foreach ($labelMap as $key => $lbl) {
            $val = isset($rawScores[$key]) && is_numeric($rawScores[$key]) ? (int) $rawScores[$key] : 88;
            $percent = max(0, min(100, $val));
            $scores[$key] = [
                'label' => $lbl,
                'raw' => $val,
                'percent' => $percent,
            ];
        }

        return $scores;
    }

    /**
     * @param list<array{key: string, label: string, value: string, section: string}> $requirements
     * @param array<string, mixed> $answers
     * @return array<string, string>
     */
    private function extractSummary(array $requirements, array $answers): array
    {
        $reqMap = [];
        foreach ($requirements as $r) {
            $reqMap[$r['key']] = $r['value'];
        }

        return [
            'location' => $reqMap['land_location'] ?? '計画地（未定）',
            'targetArea' => $reqMap['desired_area'] ?? $reqMap['plan_target_area'] ?? '約30〜35坪',
            'floors' => $reqMap['floors'] ?? $reqMap['floor_count'] ?? '2階建て (木造軸組工法)',
            'budget' => $reqMap['budget_range'] ?? '2,500万〜3,500万円',
            'family' => $reqMap['family_adults'] ?? '大人2名・子供2名 (計4名)',
            'style' => $reqMap['house_style'] ?? $reqMap['design_exterior_style'] ?? 'モダン・ナチュラル',
        ];
    }

    /**
     * @param array<string, mixed> $raw
     * @return array{headline: string, body: string, pros: list<string>, cautions: list<string>}
     */
    private function buildCommentary(array $raw): array
    {
        $pros = is_array($raw['pros'] ?? null) && count($raw['pros']) > 0
            ? array_values(array_filter($raw['pros'], 'is_string'))
            : [
                '南面からの自然光を最大限に取り入れる吹き抜けとワイド開口を採用',
                '玄関から水回り、キッチンへと回遊できるスムーズな家事ラク動線',
                '家族の成長に合わせてフレキシブルに間仕切り可能な子供部屋',
            ];

        $cautions = is_array($raw['cautions'] ?? null) && count($raw['cautions']) > 0
            ? array_values(array_filter($raw['cautions'], 'is_string'))
            : [
                '敷地境界および北側斜線制限の最終クリアランス確認が必要です',
                '構造計算（許容応力度計算）による耐震等級3の確保を推奨します',
                '詳細地盤調査の結果により基礎仕様・地盤改良の追加検討が必要となります',
            ];

        return [
            'headline' => is_string($raw['headline'] ?? null) && $raw['headline'] !== ''
                ? $raw['headline']
                : '家族のコミュニケーションと開放感を両立した現代的住居プラン',
            'body' => is_string($raw['body'] ?? null) && $raw['body'] !== ''
                ? $raw['body']
                : 'ご要望いただいたライフスタイルに寄り添い、広々としたLDKを中心に水回りの動線を最適化。日々の家事負担を軽減しながら、心地よい光と風を感じる住まいをご提案します。',
            'pros' => $pros,
            'cautions' => $cautions,
        ];
    }

    private function pickLocaleString(mixed $val, string $locale, string $default): string
    {
        if (is_string($val)) {
            return $val;
        }
        if (is_array($val)) {
            return (string) ($val[$locale] ?? $val['ja'] ?? reset($val) ?: $default);
        }

        return $default;
    }
}
