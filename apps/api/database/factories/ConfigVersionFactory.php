<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ConfigVersionStatus;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConfigVersion>
 */
class ConfigVersionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<ConfigVersion>
     */
    protected $model = ConfigVersion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $payload = [
            'schema' => 'v1',
            'title' => fake()->words(3, true),
            'steps' => [
                ['id' => 'step_1', 'order' => 1],
                ['id' => 'step_2', 'order' => 2],
            ],
        ];

        return [
            'config_document_id' => ConfigDocument::factory(),
            'version' => 1,
            'status' => ConfigVersionStatus::Published,
            'is_draft' => null,
            'schema_version' => 1,
            'payload' => $payload,
            'payload_hash' => ConfigVersion::computePayloadHash($payload),
            'label' => fake()->sentence(3),
            'created_by' => null,
            'published_by' => null,
            'based_on_version_id' => null,
            'published_at' => now(),
        ];
    }

    /**
     * Indicate that the config version is in draft state.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ConfigVersionStatus::Draft,
            'is_draft' => true,
            'published_at' => null,
            'published_by' => null,
        ]);
    }

    /**
     * Indicate that the config version is in published state.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ConfigVersionStatus::Published,
            'is_draft' => null,
            'published_at' => now(),
        ]);
    }

    /**
     * Indicate that the config version is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ConfigVersionStatus::Archived,
            'is_draft' => null,
            'published_at' => now()->subDay(),
        ]);
    }

    /**
     * Set a custom payload and automatically recompute its hash.
     *
     * @param  array<string, mixed>  $payload
     */
    public function withPayload(array $payload): static
    {
        return $this->state(fn () => [
            'payload' => $payload,
            'payload_hash' => ConfigVersion::computePayloadHash($payload),
        ]);
    }
}
