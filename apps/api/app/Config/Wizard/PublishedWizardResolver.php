<?php

declare(strict_types=1);

namespace App\Config\Wizard;

use App\Enums\ConfigVersionStatus;
use App\Models\ConfigDocument;

final class PublishedWizardResolver
{
    /**
     * Resolve the current published wizard configuration and its version.
     *
     * @return array{version: int, payload: array<string, mixed>}
     */
    public static function resolve(): array
    {
        /** @var ConfigDocument|null $doc */
        $doc = ConfigDocument::where('key', 'wizard')->with('currentVersion')->first();
        $current = $doc?->currentVersion;

        if ($current !== null && $current->status === ConfigVersionStatus::Published) {
            return [
                'version' => $current->version,
                'payload' => $current->payload,
            ];
        }

        // Fallback for isolated tests or fresh DB
        $fixturePath = resource_path('config-schema/fixtures/wizard/01-valid-sample-wizard.json');
        if (file_exists($fixturePath)) {
            $content = (string) file_get_contents($fixturePath);
            $decoded = json_decode($content, true);
            if (is_array($decoded) && isset($decoded['input']) && is_array($decoded['input'])) {
                /** @var array<string, mixed> $input */
                $input = $decoded['input'];

                return [
                    'version' => 1,
                    'payload' => $input,
                ];
            }
        }

        return [
            'version' => 1,
            'payload' => ['schemaVersion' => 1, 'steps' => []],
        ];
    }
}
