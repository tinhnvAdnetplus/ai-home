<?php

declare(strict_types=1);

use App\Enums\ConfigAuditAction;
use App\Enums\ConfigVersionStatus;
use App\Models\ConfigAuditLog;
use App\Models\ConfigDocument;
use App\Models\ConfigVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('JSON payload with Japanese, Vietnamese, and emoji round-trips byte-exact', function (): void {
    $doc = ConfigDocument::factory()->create();

    $complexPayload = [
        'ja' => '間取り・土地・注文住宅の検討（耐震等級3・ZEH基準）',
        'vi' => 'Hệ thống cấu hình nhà thông minh AI HOME 2026',
        'emoji' => '🏡 📐 ✨ 🚀 🇯🇵 🇻🇳',
        'details' => [
            'description' => 'テスト用設定ファイル: Có dấu tiếng Việt đầy đủ và chữ Hán 日本語',
        ],
    ];

    $version = ConfigVersion::factory()->published()->withPayload($complexPayload)->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);

    $freshVersion = ConfigVersion::findOrFail($version->id);

    expect($freshVersion->payload)->toBe($complexPayload)
        ->and($freshVersion->payload['ja'])->toBe($complexPayload['ja'])
        ->and($freshVersion->payload['vi'])->toBe($complexPayload['vi'])
        ->and($freshVersion->payload['emoji'])->toBe($complexPayload['emoji']);
});

test('JSON payload preserves strict types for numbers, strings, booleans, and nulls in nested arrays', function (): void {
    $doc = ConfigDocument::factory()->create();

    $typedPayload = [
        'int_one' => 1,
        'float_val' => 1.5,
        'string_one' => '1',
        'bool_true' => true,
        'bool_false' => false,
        'null_val' => null,
        'nested' => [
            'zero_int' => 0,
            'zero_float' => 0.0,
            'empty_string' => '',
            'inner_list' => [1, 1.5, '1', true, false, null],
        ],
    ];

    $version = ConfigVersion::factory()->published()->withPayload($typedPayload)->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);

    $freshPayload = ConfigVersion::findOrFail($version->id)->payload;

    expect($freshPayload['int_one'])->toBe(1)
        ->and($freshPayload['int_one'])->not->toBe('1')
        ->and($freshPayload['float_val'])->toBe(1.5)
        ->and($freshPayload['string_one'])->toBe('1')
        ->and($freshPayload['string_one'])->not->toBe(1)
        ->and($freshPayload['bool_true'])->toBe(true)
        ->and($freshPayload['bool_false'])->toBe(false)
        ->and($freshPayload['null_val'])->toBeNull()
        ->and($freshPayload['nested']['zero_int'])->toBe(0)
        ->and($freshPayload['nested']['inner_list'])->toBe([1, 1.5, '1', true, false, null]);
});

test('a 1 MB payload round-trips without data truncation or corruption', function (): void {
    $doc = ConfigDocument::factory()->create();

    // Generate ~1 MB payload
    $largeString = str_repeat('AIHOME_CONFIG_CHUNK_1234567890_', 35000); // ~1.1 MB
    $largePayload = [
        'size_check' => '1MB+',
        'chunk' => $largeString,
        'meta' => [
            'length' => strlen($largeString),
        ],
    ];

    $version = ConfigVersion::factory()->published()->withPayload($largePayload)->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);

    $freshPayload = ConfigVersion::findOrFail($version->id)->payload;

    expect(strlen((string) $freshPayload['chunk']))->toBe(strlen($largeString))
        ->and($freshPayload['chunk'])->toBe($largeString);
});

test('invalid payload containing NAN or resource is rejected before hitting the database', function (): void {
    $doc = ConfigDocument::factory()->create();

    // NAN cannot be JSON encoded
    $invalidPayload = [
        'invalid_number' => NAN,
    ];

    expect(function () use ($invalidPayload): void {
        ConfigVersion::computePayloadHash($invalidPayload);
    })->toThrow(\JsonException::class);

    // Eloquent model creation with un-encodable float should also fail
    expect(function () use ($doc, $invalidPayload): void {
        $version = new ConfigVersion();
        $version->forceFill([
            'config_document_id' => $doc->id,
            'version' => 1,
            'status' => ConfigVersionStatus::Published,
            'schema_version' => 1,
            'payload' => $invalidPayload,
            'payload_hash' => 'dummy',
        ]);
        $version->save();
    })->toThrow(\Illuminate\Database\Eloquent\JsonEncodingException::class);
});

test('mass assignment does not set guarded columns on ConfigVersion and ConfigDocument', function (): void {
    // 1. ConfigDocument: current_version_id is guarded
    $doc = ConfigDocument::create([
        'key' => 'wizard',
        'scope' => 'global',
        'current_version_id' => 999,
    ]);
    expect($doc->current_version_id)->toBeNull();

    // 2. ConfigVersion: status, is_draft, payload_hash, published_at are guarded
    $version = new ConfigVersion();
    $version->fill([
        'config_document_id' => $doc->id,
        'version' => 1,
        'schema_version' => 1,
        'payload' => ['foo' => 'bar'],
        'status' => 'published',
        'is_draft' => null,
        'payload_hash' => 'unauthorized_hash',
        'published_at' => now(),
    ]);

    expect($version->status)->toBeNull()
        ->and($version->is_draft)->toBeNull()
        ->and($version->payload_hash)->toBeNull()
        ->and($version->published_at)->toBeNull();
});

test('audit log immutability: updating or deleting through Eloquent throws LogicException', function (): void {
    $doc = ConfigDocument::factory()->create();
    $log = ConfigAuditLog::factory()->create([
        'config_document_id' => $doc->id,
        'action' => ConfigAuditAction::CreateDraft,
        'summary' => ['initial' => 'state'],
    ]);

    // created_at is set, updated_at is null
    expect($log->created_at)->not->toBeNull()
        ->and($log->getAttribute('updated_at'))->toBeNull();

    // Updating through Eloquent must throw LogicException
    expect(fn () => $log->update(['action' => ConfigAuditAction::Rollback]))
        ->toThrow(\LogicException::class, 'ConfigAuditLog records are append-only and cannot be updated.');

    // Deleting through Eloquent must throw LogicException
    expect(fn () => $log->delete())
        ->toThrow(\LogicException::class, 'ConfigAuditLog records are append-only and cannot be deleted.');
});

test('factories produce valid rows and state modifiers work as expected', function (): void {
    $user = User::factory()->create();
    $doc = ConfigDocument::factory()->create(['key' => 'custom_doc']);

    $draft = ConfigVersion::factory()->draft()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
        'created_by' => $user->id,
    ]);
    expect($draft->status)->toBe(ConfigVersionStatus::Draft)
        ->and($draft->is_draft)->toBeTrue()
        ->and($draft->published_at)->toBeNull()
        ->and($draft->created_by)->toBe($user->id);

    $doc2 = ConfigDocument::factory()->create();
    $published = ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc2->id,
        'version' => 1,
        'published_by' => $user->id,
    ]);
    expect($published->status)->toBe(ConfigVersionStatus::Published)
        ->and($published->is_draft)->toBeNull()
        ->and($published->published_at)->not->toBeNull()
        ->and($published->published_by)->toBe($user->id);

    $archived = ConfigVersion::factory()->archived()->create([
        'config_document_id' => $doc2->id,
        'version' => 2,
    ]);
    expect($archived->status)->toBe(ConfigVersionStatus::Archived)
        ->and($archived->is_draft)->toBeNull()
        ->and($archived->published_at)->not->toBeNull();

    $auditLog = ConfigAuditLog::factory()->action(ConfigAuditAction::Publish)->create([
        'config_document_id' => $doc2->id,
        'config_version_id' => $published->id,
        'user_id' => $user->id,
    ]);
    expect($auditLog->action)->toBe(ConfigAuditAction::Publish)
        ->and($auditLog->config_document_id)->toBe($doc2->id);
});

test('query scopes drafts() and published() return only matching versions', function (): void {
    $doc = ConfigDocument::factory()->create();

    ConfigVersion::factory()->draft()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
    ]);

    $doc2 = ConfigDocument::factory()->create();
    ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc2->id,
        'version' => 1,
    ]);
    ConfigVersion::factory()->archived()->create([
        'config_document_id' => $doc2->id,
        'version' => 2,
    ]);

    $drafts = ConfigVersion::drafts()->get();
    $published = ConfigVersion::published()->get();

    expect($drafts->count())->toBe(1)
        ->and($drafts->first()->status)->toBe(ConfigVersionStatus::Draft)
        ->and($published->count())->toBe(1)
        ->and($published->first()->status)->toBe(ConfigVersionStatus::Published);
});

test('typed relations correctly associate documents, versions, users, and audit logs', function (): void {
    $user = User::factory()->create();
    $doc = ConfigDocument::factory()->create(['key' => 'planner']);

    $v1 = ConfigVersion::factory()->published()->create([
        'config_document_id' => $doc->id,
        'version' => 1,
        'created_by' => $user->id,
        'published_by' => $user->id,
    ]);

    $v2 = ConfigVersion::factory()->draft()->create([
        'config_document_id' => $doc->id,
        'version' => 2,
        'based_on_version_id' => $v1->id,
        'created_by' => $user->id,
    ]);

    $doc->forceFill(['current_version_id' => $v1->id])->save();

    $log = ConfigAuditLog::factory()->action(ConfigAuditAction::Publish)->create([
        'config_document_id' => $doc->id,
        'config_version_id' => $v1->id,
        'user_id' => $user->id,
    ]);

    // Test ConfigDocument relations
    expect($doc->currentVersion)->not->toBeNull()
        ->and($doc->currentVersion->id)->toBe($v1->id)
        ->and($doc->versions)->toHaveCount(2)
        ->and($doc->draftVersion)->not->toBeNull()
        ->and($doc->draftVersion->id)->toBe($v2->id)
        ->and($doc->auditLogs)->toHaveCount(1);

    // Test ConfigVersion relations
    expect($v2->document->id)->toBe($doc->id)
        ->and($v2->creator->id)->toBe($user->id)
        ->and($v2->basedOnVersion->id)->toBe($v1->id)
        ->and($v1->publisher->id)->toBe($user->id)
        ->and($v1->auditLogs)->toHaveCount(1);

    // Test ConfigAuditLog relations
    expect($log->document->id)->toBe($doc->id)
        ->and($log->version->id)->toBe($v1->id)
        ->and($log->user->id)->toBe($user->id);
});
