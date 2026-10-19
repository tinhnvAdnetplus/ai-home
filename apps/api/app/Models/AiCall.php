<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $endpoint
 * @property string $provider
 * @property string $model
 * @property string $source
 * @property bool $degraded
 * @property int $input_tokens
 * @property int $output_tokens
 * @property int $latency_ms
 * @property int $status
 * @property Carbon|null $created_at
 * @property-read User|null $user
 */
class AiCall extends Model
{
    /**
     * AI call rows are append-only without updated_at.
     */
    public const UPDATED_AT = null;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'ai_calls';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'endpoint',
        'provider',
        'model',
        'source',
        'degraded',
        'input_tokens',
        'output_tokens',
        'latency_ms',
        'status',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'degraded' => 'boolean',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'latency_ms' => 'integer',
            'status' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the user associated with this AI call.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
