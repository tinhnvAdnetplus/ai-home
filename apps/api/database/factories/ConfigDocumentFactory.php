<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ConfigDocument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ConfigDocument>
 */
class ConfigDocumentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<ConfigDocument>
     */
    protected $model = ConfigDocument::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => 'config_' . Str::lower(fake()->unique()->word()),
            'scope' => 'global',
            'current_version_id' => null,
        ];
    }
}
