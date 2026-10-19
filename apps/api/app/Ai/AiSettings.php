<?php

declare(strict_types=1);

namespace App\Ai;

use App\Models\ConfigDocument;
use Illuminate\Support\Facades\Cache;

final class AiSettings
{
    public const CACHE_KEY = 'ai_settings_effective';
    public const CACHE_TTL_SECONDS = 60;

    /**
     * @return array<string, mixed>
     */
    public function getEffective(): array
    {
        /** @var array<string, mixed> */
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function (): array {
            $doc = ConfigDocument::where('key', 'ai')->with('currentVersion')->first();
            if ($doc?->currentVersion !== null) {
                return array_merge(self::getDefaults(), $doc->currentVersion->payload);
            }

            return self::getDefaults();
        });
    }

    public function bustCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public function isEnabled(): bool
    {
        return (bool) ($this->getEffective()['enabled'] ?? true);
    }

    public function getProvider(): string
    {
        return (string) ($this->getEffective()['provider'] ?? 'local');
    }

    public function getModel(): string
    {
        return (string) ($this->getEffective()['model'] ?? 'local-heuristic-v1');
    }

    public function getTemperature(): float
    {
        return (float) ($this->getEffective()['temperature'] ?? 0.2);
    }

    public function getMaxTokens(): int
    {
        return (int) ($this->getEffective()['maxTokens'] ?? 4096);
    }

    public function getDailyLimit(): int
    {
        return (int) ($this->getEffective()['dailyLimit'] ?? 300);
    }

    public function getTimeoutSeconds(): int
    {
        return (int) ($this->getEffective()['timeoutSeconds'] ?? 20);
    }

    public function getPrompt(string $which, string $locale = 'ja'): string
    {
        $effective = $this->getEffective();
        $prompts = $effective['prompts'] ?? [];
        if (is_array($prompts) && isset($prompts[$which]) && is_array($prompts[$which])) {
            $group = $prompts[$which];
            if (isset($group[$locale]) && is_string($group[$locale]) && trim($group[$locale]) !== '') {
                return $group[$locale];
            }
            if (isset($group['ja']) && is_string($group['ja']) && trim($group['ja']) !== '') {
                return $group['ja'];
            }
        }

        return self::loadFilePrompt($which, $locale);
    }

    public function renderPrompt(string $template, string $formattedAnswers, string $locale = 'ja'): string
    {
        $rendered = str_replace('{{locale}}', $locale, $template);
        if (str_contains($rendered, '{{answers}}')) {
            $rendered = str_replace('{{answers}}', $formattedAnswers, $rendered);
        }

        return $rendered;
    }

    /**
     * @return array<string, mixed>
     */
    public static function getDefaults(): array
    {
        $provider = (string) config('ai.provider', 'local');
        $model = match ($provider) {
            'gemini' => (string) config('ai.gemini.model', 'gemini-3.8-flash'),
            'claude' => (string) config('ai.claude.model', 'claude-3-5-haiku-20241022'),
            default => 'local-heuristic-v1',
        };

        return [
            'schemaVersion' => 1,
            'provider' => $provider,
            'model' => $model,
            'temperature' => 0.2,
            'maxTokens' => 4096,
            'dailyLimit' => (int) config('ai.daily_limit', 300),
            'timeoutSeconds' => (int) config('ai.timeout', 20),
            'enabled' => true,
            'prompts' => [
                'constraints' => [
                    'ja' => self::loadFilePrompt('constraints', 'ja'),
                ],
                'commentary' => [
                    'ja' => self::loadFilePrompt('commentary', 'ja'),
                ],
            ],
        ];
    }

    public static function loadFilePrompt(string $which, string $locale = 'ja'): string
    {
        $file = resource_path("ai/prompts/{$which}.{$locale}.md");
        if (! file_exists($file)) {
            $file = resource_path("ai/prompts/{$which}.ja.md");
        }
        if (file_exists($file)) {
            return (string) file_get_contents($file);
        }

        return "You are an AI residential architect assistant for {$which}.";
    }
}
