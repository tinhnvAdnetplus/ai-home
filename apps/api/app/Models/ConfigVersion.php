<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ConfigVersionStatus;
use Database\Factories\ConfigVersionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $config_document_id
 * @property int $version
 * @property ConfigVersionStatus $status
 * @property bool|null $is_draft
 * @property int $schema_version
 * @property array<string, mixed> $payload
 * @property string $payload_hash
 * @property string|null $label
 * @property int|null $created_by
 * @property int|null $published_by
 * @property int|null $based_on_version_id
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ConfigDocument $document
 * @property-read User|null $creator
 * @property-read User|null $publisher
 * @property-read ConfigVersion|null $basedOnVersion
 * @property-read Collection<int, ConfigAuditLog> $auditLogs
 */
class ConfigVersion extends Model
{
    /** @use HasFactory<ConfigVersionFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'config_versions';

    /**
     * The attributes that are mass assignable.
     * Note: status, is_draft, payload_hash, published_at are strictly guarded
     * and only set through specialized business flows via forceFill().
     *
     * @var list<string>
     */
    protected $fillable = [
        'config_document_id',
        'version',
        'schema_version',
        'payload',
        'label',
        'created_by',
        'published_by',
        'based_on_version_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config_document_id' => 'integer',
            'version' => 'integer',
            'status' => ConfigVersionStatus::class,
            'is_draft' => 'boolean',
            'schema_version' => 'integer',
            'payload' => 'array',
            'created_by' => 'integer',
            'published_by' => 'integer',
            'based_on_version_id' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Recursively sort associative array keys while preserving sequential list ordering and data types.
     *
     * @param  array<mixed>  $data
     * @return array<mixed>
     */
    public static function canonicalizePayload(array $data): array
    {
        if (! array_is_list($data)) {
            ksort($data, SORT_STRING);
        }

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = self::canonicalizePayload($value);
            }
        }

        return $data;
    }

    /**
     * Compute a deterministic sha256 hash of the canonicalized payload.
     *
     * Associative array keys are sorted at every level, while numeric/list order and value types
     * (e.g. 1 vs 1.0 vs "1" vs true) are strictly preserved.
     * Note: Unicode normalization differences (NFC vs NFD) produce different raw UTF-8 byte sequences
     * and therefore produce different hashes.
     *
     * @param  array<string, mixed>  $payload
     * @return string 64-character lowercase hex sha256
     *
     * @throws \JsonException if payload contains values that cannot be encoded (e.g. INF, NAN, resource)
     */
    public static function computePayloadHash(array $payload): string
    {
        $canonical = self::canonicalizePayload($payload);
        $json = json_encode($canonical, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        return hash('sha256', $json);
    }

    /**
     * Compute a strong deterministic ETag for a draft version.
     */
    public static function computeDraftEtag(self $draft): string
    {
        $timestamp = $draft->updated_at?->toISOString() ?? '';
        $raw = hash('sha256', "draft:{$draft->id}:{$draft->version}:{$draft->payload_hash}:{$timestamp}");

        return '"'.$raw.'"';
    }

    /**
     * Scope a query to only include draft versions.
     *
     * @param  Builder<static>  $query
     */
    public function scopeDrafts(Builder $query): void
    {
        $query->where('status', ConfigVersionStatus::Draft);
    }

    /**
     * Scope a query to only include published versions.
     *
     * @param  Builder<static>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', ConfigVersionStatus::Published);
    }

    /**
     * @return BelongsTo<ConfigDocument, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(ConfigDocument::class, 'config_document_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    /**
     * @return BelongsTo<ConfigVersion, $this>
     */
    public function basedOnVersion(): BelongsTo
    {
        return $this->belongsTo(ConfigVersion::class, 'based_on_version_id');
    }

    /**
     * @return HasMany<ConfigAuditLog, $this>
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(ConfigAuditLog::class, 'config_version_id');
    }
}
