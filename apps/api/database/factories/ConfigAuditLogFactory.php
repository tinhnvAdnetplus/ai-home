<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ConfigAuditAction;
use App\Models\ConfigAuditLog;
use App\Models\ConfigDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConfigAuditLog>
 */
class ConfigAuditLogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<ConfigAuditLog>
     */
    protected $model = ConfigAuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'config_document_id' => ConfigDocument::factory(),
            'config_version_id' => null,
            'user_id' => null,
            'action' => ConfigAuditAction::CreateDraft,
            'summary' => [
                'event' => 'draft_created',
                'description' => 'Draft version initialized',
            ],
            'request_id' => fake()->uuid(),
            'created_at' => now(),
        ];
    }

    /**
     * Set a specific audit action.
     */
    public function action(ConfigAuditAction $action): static
    {
        return $this->state(fn () => [
            'action' => $action,
        ]);
    }
}
