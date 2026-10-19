<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ConfigAuditAction;
use Database\Factories\ConfigAuditLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $config_document_id
 * @property int|null $config_version_id
 * @property int|null $user_id
 * @property ConfigAuditAction $action
 * @property array<string, mixed>|null $summary
 * @property string|null $request_id
 * @property Carbon|null $created_at
 * @property-read ConfigDocument $document
 * @property-read ConfigVersion|null $version
 * @property-read User|null $user
 */
class ConfigAuditLog extends Model
{
    /** @use HasFactory<ConfigAuditLogFactory> */
    use HasFactory;

    /**
     * Audit log rows are append-only.
     */
    public const UPDATED_AT = null;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'config_audit_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'config_document_id',
        'config_version_id',
        'user_id',
        'action',
        'summary',
        'request_id',
        'created_at',
    ];

    /**
     * Model booted event listeners.
     */
    protected static function booted(): void
    {
        static::updating(function (self $model): void {
            throw new LogicException('ConfigAuditLog records are append-only and cannot be updated.');
        });

        static::deleting(function (self $model): void {
            throw new LogicException('ConfigAuditLog records are append-only and cannot be deleted.');
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config_document_id' => 'integer',
            'config_version_id' => 'integer',
            'user_id' => 'integer',
            'action' => ConfigAuditAction::class,
            'summary' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<ConfigDocument, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(ConfigDocument::class, 'config_document_id');
    }

    /**
     * @return BelongsTo<ConfigVersion, $this>
     */
    public function version(): BelongsTo
    {
        return $this->belongsTo(ConfigVersion::class, 'config_version_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
