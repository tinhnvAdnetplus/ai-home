<?php

declare(strict_types=1);

use App\Enums\ConfigAuditAction;
use App\Enums\ConfigVersionStatus;
use App\Models\ConfigAuditLog;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('unique key and scope constraint rejects duplicate key in same scope but allows different scopes', function (): void {
    ConfigDocument::create(['key' => 'wizard', 'scope' => 'global']);

    // Same key and same scope must throw QueryException
    expect(fn () => ConfigDocument::create(['key' => 'wizard', 'scope' => 'global']))
        ->toThrow(QueryException::class);

    // Same key with a different scope is allowed
    $tenantDoc = ConfigDocument::create(['key' => 'wizard', 'scope' => 'tenant_alpha']);
    expect($tenantDoc->id)->toBeGreaterThan(0);
});

test('unique document_id and version constraint rejects duplicate versions for same document', function (): void {
    $doc = ConfigDocument::create(['key' => 'wizard', 'scope' => 'global']);

    ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);

    expect(fn () => ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]))->toThrow(QueryException::class);

    // Another document can have version 1
    $anotherDoc = ConfigDocument::create(['key' => 'catalog', 'scope' => 'global']);
    $anotherVersion = ConfigVersion::factory()->published()->create([
        'config_document_id' => $anotherDoc->id,
        'version' => 1,
    ]);
    expect($anotherVersion->id)->toBeGreaterThan(0);
});

test('at most one draft per document is enforced by database constraint', function (): void {
    $doc = ConfigDocument::create(['key' => 'wizard', 'scope' => 'global']);

    // Create first draft (is_draft = 1) using forceFill to simulate T1.4 draft creation
    $draft1 = new ConfigVersion();
    $draft1->forceFill([
        'config_document_id' => $doc->id,
        'version' => 1,
        'status' => ConfigVersionStatus::Draft,
        'is_draft' => true,
        'schema_version' => 1,
        'payload' => ['draft' => 1],
        'payload_hash' => ConfigVersion::computePayloadHash(['draft' => 1]),
    ])->save();

    // A second draft for the same document must be rejected by the database (QueryException)
    $draft2 = new ConfigVersion();
    $draft2->forceFill([
        'config_document_id' => $doc->id,
        'version' => 2,
        'status' => ConfigVersionStatus::Draft,
        'is_draft' => true,
        'schema_version' => 1,
        'payload' => ['draft' => 2],
        'payload_hash' => ConfigVersion::computePayloadHash(['draft' => 2]),
    ]);

    expect(fn () => $draft2->save())->toThrow(QueryException::class);
});

test('multiple published and archived versions with is_draft null are allowed for same document', function (): void {
    $doc = ConfigDocument::create(['key' => 'wizard', 'scope' => 'global']);

    // Multiple versions where is_draft is NULL must be allowed by the database
    for ($i = 1; $i <= 5; $i++) {
        $version = new ConfigVersion();
        $version->forceFill([
            'config_document_id' => $doc->id,
            'version' => $i,
            'status' => $i === 5 ? ConfigVersionStatus::Published : ConfigVersionStatus::Archived,
            'is_draft' => null,
            'schema_version' => 1,
            'payload' => ['v' => $i],
            'payload_hash' => ConfigVersion::computePayloadHash(['v' => $i]),
        ])->save();

        expect($version->id)->toBeGreaterThan(0);
    }

    expect($doc->versions()->count())->toBe(5);
});

test('two different documents may each have their own active draft', function (): void {
    $doc1 = ConfigDocument::create(['key' => 'wizard', 'scope' => 'global']);
    $doc2 = ConfigDocument::create(['key' => 'planner', 'scope' => 'global']);

    $draft1 = ConfigVersion::factory()->draft()->create([
        'config_document_id' => $doc1->id,
        'version' => 1,
    ]);

    $draft2 = ConfigVersion::factory()->draft()->create([
        'config_document_id' => $doc2->id,
        'version' => 1,
    ]);

    expect($draft1->id)->toBeGreaterThan(0)
        ->and($draft2->id)->toBeGreaterThan(0)
        ->and($draft1->is_draft)->toBeTrue()
        ->and($draft2->is_draft)->toBeTrue();
});

test('deleting a document cascades and deletes all its versions and audit logs', function (): void {
    $doc = ConfigDocument::factory()->create();

    $version1 = ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);
    $version2 = ConfigVersion::factory()->draft()->create([
        'config_document_id' => $doc->id,
        'version' => 2,
    ]);

    ConfigAuditLog::factory()->create([
        'config_document_id' => $doc->id,
        'config_version_id' => $version1->id,
        'action' => ConfigAuditAction::Publish,
    ]);
    ConfigAuditLog::factory()->create([
        'config_document_id' => $doc->id,
        'config_version_id' => $version2->id,
        'action' => ConfigAuditAction::CreateDraft,
    ]);

    expect(ConfigVersion::where('config_document_id', $doc->id)->count())->toBe(2)
        ->and(ConfigAuditLog::where('config_document_id', $doc->id)->count())->toBe(2);

    // Delete document directly in database to test DB-level cascade
    $doc->delete();

    expect(ConfigVersion::where('config_document_id', $doc->id)->count())->toBe(0)
        ->and(ConfigAuditLog::where('config_document_id', $doc->id)->count())->toBe(0);
});

test('deleting a user sets foreign keys to NULL in versions and audit logs', function (): void {
    $user = User::factory()->create();
    $doc = ConfigDocument::factory()->create();

    $version = ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc->id,
        'created_by' => $user->id,
        'published_by' => $user->id,
    ]);

    $log = ConfigAuditLog::factory()->create([
        'config_document_id' => $doc->id,
        'config_version_id' => $version->id,
        'user_id' => $user->id,
    ]);

    // Delete the user
    $user->delete();

    $version->refresh();
    $log->refresh();

    expect($version->created_by)->toBeNull()
        ->and($version->published_by)->toBeNull()
        ->and($log->user_id)->toBeNull();
});

test('deleting the version referenced by current_version_id sets current_version_id to NULL', function (): void {
    $doc = ConfigDocument::factory()->create();

    $version = ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);

    // Set current_version_id via forceFill as T1.4 will do
    $doc->forceFill(['current_version_id' => $version->id])->save();
    expect($doc->fresh()->current_version_id)->toBe($version->id);

    // Delete the version
    $version->delete();

    expect($doc->fresh()->current_version_id)->toBeNull();
});
