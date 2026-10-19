<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\Role;
use App\Models\User;
use App\Support\Ability;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->scoped(\App\Ai\LlmProvider::class, function ($app): \App\Ai\LlmProvider {
            /** @var \App\Ai\AiSettings $aiSettings */
            $aiSettings = $app->make(\App\Ai\AiSettings::class);
            $local = new \App\Ai\Providers\LocalHeuristicProvider();

            if (! $aiSettings->isEnabled()) {
                return new \App\Ai\Providers\LocalHeuristicProvider(degraded: true);
            }

            $providerName = $aiSettings->getProvider();

            if ($app->isLocal() && $app->bound('request')) {
                $req = $app->make('request');
                if ($req instanceof Request && $req->hasHeader('X-Simulate-AI-Provider')) {
                    $providerName = (string) $req->header('X-Simulate-AI-Provider');
                }
            }

            if ($providerName === 'local') {
                return $local;
            }

            if ($providerName === 'gemini' || $providerName === 'gemini-empty') {
                $geminiKey = $providerName === 'gemini-empty' ? null : config('ai.gemini.api_key');
                $geminiModel = $aiSettings->getModel();
                $geminiBaseUrl = (string) config('ai.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');

                $gemini = new \App\Ai\Providers\GeminiProvider(
                    apiKey: is_string($geminiKey) && trim($geminiKey) !== '' ? $geminiKey : null,
                    model: $geminiModel,
                    baseUrl: $geminiBaseUrl,
                );

                return new \App\Ai\Providers\FallbackProvider(
                    primary: $gemini,
                    fallback: $local,
                    primaryName: 'gemini',
                );
            }

            if ($providerName === 'claude' || $providerName === 'claude-empty') {
                $claudeKey = $providerName === 'claude-empty' ? null : config('ai.claude.api_key');
                $claudeModel = $aiSettings->getModel();
                $claudeBaseUrl = (string) config('ai.claude.base_url', 'https://api.anthropic.com/v1');

                $claude = new \App\Ai\Providers\ClaudeProvider(
                    apiKey: is_string($claudeKey) && trim($claudeKey) !== '' ? $claudeKey : null,
                    model: $claudeModel,
                    baseUrl: $claudeBaseUrl,
                );

                return new \App\Ai\Providers\FallbackProvider(
                    primary: $claude,
                    fallback: $local,
                    primaryName: 'claude',
                );
            }

            return $local;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $user = $request->user();
            $key = $user !== null ? (string) $user->getAuthIdentifier() : (string) $request->ip();

            return Limit::perMinute(60)->by($key);
        });

        RateLimiter::for('ai', function (Request $request): array {
            $user = $request->user();
            $key = $user !== null ? (string) $user->getAuthIdentifier() : (string) $request->ip();
            $dailyLimit = app(\App\Ai\AiSettings::class)->getDailyLimit();

            $limits = [
                Limit::perMinute(10)->by($key.':min'),
            ];

            if ($dailyLimit > 0) {
                $limits[] = Limit::perDay($dailyLimit)->by($key.':day');
            }

            return $limits;
        });

        RateLimiter::for('ai-layout', function (Request $request): array {
            $user = $request->user();
            $key = $user !== null ? (string) $user->getAuthIdentifier() : (string) $request->ip();
            $dailyLimit = app(\App\Ai\AiSettings::class)->getDailyLimit();
            $limits = [Limit::perMinute(40)->by($key.':layout-min')];
            if ($dailyLimit > 0) {
                $limits[] = Limit::perDay($dailyLimit * 4)->by($key.':layout-day');
            }

            return $limits;
        });

        RateLimiter::for('auth-register', function (Request $request): Limit {
            return Limit::perMinute(5)->by((string) $request->ip());
        });

        RateLimiter::for('config-write', function (Request $request): Limit {
            $user = $request->user();
            $key = $user !== null ? (string) $user->getAuthIdentifier() : (string) $request->ip();

            return Limit::perMinute(30)->by($key);
        });

        Gate::define(Ability::MANAGE_CONFIG, function (User $user): bool {
            return in_array($user->role, [Role::ADMIN, Role::EDITOR], true);
        });

        Gate::define(Ability::MANAGE_USERS, function (User $user): bool {
            return $user->role === Role::ADMIN;
        });

        Gate::define(Ability::REVIEW_PLANS, function (User $user): bool {
            return in_array($user->role, [Role::ADMIN, Role::ARCHITECT], true);
        });

        Gate::define(Ability::OWN_PLANS, function (User $user): bool {
            return true;
        });

        Gate::policy(\App\Models\Project::class, \App\Policies\ProjectPolicy::class);
    }
}
