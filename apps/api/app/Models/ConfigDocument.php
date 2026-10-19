<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ConfigDocumentFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $key
 * @property string $scope
 * @property int|null $current_version_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ConfigVersion|null $currentVersion
 * @property-read Collection<int, ConfigVersion> $versions
 * @property-read Collection<int, ConfigAuditLog> $auditLogs
 * @property-read ConfigVersion|null $draftVersion
 */
class ConfigDocument extends Model
{
    /** @use HasFactory<ConfigDocumentFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'config_documents';

    /**
     * The attributes that are mass assignable.
     * Note: current_version_id is guarded against mass assignment and set via forceFill.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'scope',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_version_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ConfigVersion, $this>
     */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ConfigVersion::class, 'current_version_id');
    }

    /**
     * @return HasMany<ConfigVersion, $this>
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ConfigVersion::class, 'config_document_id');
    }

    /**
     * @return HasMany<ConfigAuditLog, $this>
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(ConfigAuditLog::class, 'config_document_id');
    }

    /**
     * @return HasOne<ConfigVersion, $this>
     */
    public function draftVersion(): HasOne
    {
        return $this->hasOne(ConfigVersion::class, 'config_document_id')->where('is_draft', true);
    }
}
