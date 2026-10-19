<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\AiCall;
use Illuminate\Support\Facades\DB;

final class GetAiUsage
{
    /**
     * @return array{
     *     recent_calls: list<array<string, mixed>>,
     *     daily_totals: list<array<string, mixed>>
     * }
     */
    public function handle(): array
    {
        $recentCalls = AiCall::with('user:id,name,email')
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->map(function (AiCall $call): array {
                return [
                    'id' => $call->id,
                    'user_id' => $call->user_id,
                    'user_name' => $call->user?->name,
                    'endpoint' => $call->endpoint,
                    'provider' => $call->provider,
                    'model' => $call->model,
                    'source' => $call->source,
                    'degraded' => $call->degraded,
                    'input_tokens' => $call->input_tokens,
                    'output_tokens' => $call->output_tokens,
                    'latency_ms' => $call->latency_ms,
                    'status' => $call->status,
                    'created_at' => $call->created_at?->toISOString(),
                ];
            })
            ->all();

        $dailyTotals = DB::table('ai_calls')
            ->selectRaw('DATE(created_at) as date, provider, count(*) as total_calls, sum(input_tokens) as total_input_tokens, sum(output_tokens) as total_output_tokens, round(avg(latency_ms), 1) as avg_latency_ms, sum(case when degraded = 1 then 1 else 0 end) as degraded_calls')
            ->groupByRaw('DATE(created_at), provider')
            ->orderByRaw('DATE(created_at) DESC, provider ASC')
            ->get()
            ->map(function (object $row): array {
                return [
                    'date' => (string) $row->date,
                    'provider' => (string) $row->provider,
                    'total_calls' => (int) $row->total_calls,
                    'total_input_tokens' => (int) $row->total_input_tokens,
                    'total_output_tokens' => (int) $row->total_output_tokens,
                    'avg_latency_ms' => (float) $row->avg_latency_ms,
                    'degraded_calls' => (int) $row->degraded_calls,
                ];
            })
            ->all();

        return [
            'recent_calls' => $recentCalls,
            'daily_totals' => $dailyTotals,
        ];
    }
}
