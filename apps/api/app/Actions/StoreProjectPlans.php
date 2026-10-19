<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\ConfigVersion;
use App\Models\Project;
use App\Models\ProjectPlan;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

final class StoreProjectPlans
{
    /**
     * @param Project $project
     * @param list<mixed> $plansData
     * @return Collection<int, ProjectPlan>
     */
    public function handle(Project $project, array $plansData): Collection
    {
        if (count($plansData) === 0) {
            throw ValidationException::withMessages(['plans' => ['At least one plan must be provided.']]);
        }

        if (count($plansData) > 3) {
            throw ValidationException::withMessages(['plans' => ['A maximum of 3 plans can be uploaded at once.']]);
        }

        /** @var Collection<int, ProjectPlan> $created */
        $created = new Collection();

        foreach ($plansData as $index => $item) {
            if (!is_array($item)) {
                throw ValidationException::withMessages(["plans.{$index}" => ['Plan must be an object.']]);
            }

            $label = $item['label'] ?? null;
            if (!is_string($label) || trim($label) === '') {
                throw ValidationException::withMessages(["plans.{$index}.label" => ['Plan label is required and must be a string.']]);
            }

            $model = $item['model'] ?? null;
            if (!is_array($model) || array_is_list($model)) {
                throw ValidationException::withMessages(["plans.{$index}.model" => ['Plan model must be a JSON object.']]);
            }

            $score = $item['score'] ?? null;
            if ($score !== null && (!is_array($score) || array_is_list($score))) {
                throw ValidationException::withMessages(["plans.{$index}.score" => ['Plan score must be a JSON object or null.']]);
            }

            $canonical = ConfigVersion::canonicalizePayload($model);
            $hash = hash('sha256', (string) json_encode($canonical, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

            $plan = new ProjectPlan();
            $plan->project_id = $project->id;
            $plan->label = trim($label);
            $plan->score = $score;
            $plan->model = $model;
            $plan->model_hash = $hash;
            $plan->save();

            $created->push($plan);
        }

        return $created;
    }
}
