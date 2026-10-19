<?php

declare(strict_types=1);

use App\Models\ConfigVersion;

test('computePayloadHash is independent of key order at root and nested levels', function (): void {
    $payloadA = [
        'z_key' => 100,
        'a_key' => 'start',
        'nested' => [
            'delta' => 4,
            'alpha' => 1,
            'charlie' => 3,
            'bravo' => 2,
        ],
    ];

    $payloadB = [
        'nested' => [
            'alpha' => 1,
            'charlie' => 3,
            'bravo' => 2,
            'delta' => 4,
        ],
        'a_key' => 'start',
        'z_key' => 100,
    ];

    $hashA = ConfigVersion::computePayloadHash($payloadA);
    $hashB = ConfigVersion::computePayloadHash($payloadB);

    expect($hashA)->toBe($hashB)
        ->and(strlen($hashA))->toBe(64);
});

test('computePayloadHash preserves order of sequential list arrays', function (): void {
    // Array elements in a sequential list must NOT be sorted because list order is meaningful
    $payloadList1 = ['items' => ['first', 'second', 'third']];
    $payloadList2 = ['items' => ['third', 'second', 'first']];

    $hash1 = ConfigVersion::computePayloadHash($payloadList1);
    $hash2 = ConfigVersion::computePayloadHash($payloadList2);

    expect($hash1)->not->toBe($hash2);
});

test('computePayloadHash is sensitive to value types (int vs string vs float vs bool)', function (): void {
    $intHash = ConfigVersion::computePayloadHash(['val' => 1]);
    $stringHash = ConfigVersion::computePayloadHash(['val' => '1']);
    $boolHash = ConfigVersion::computePayloadHash(['val' => true]);
    $nullHash = ConfigVersion::computePayloadHash(['val' => null]);
    $floatHash = ConfigVersion::computePayloadHash(['val' => 1.5]);

    expect($intHash)->not->toBe($stringHash)
        ->and($intHash)->not->toBe($boolHash)
        ->and($intHash)->not->toBe($nullHash)
        ->and($intHash)->not->toBe($floatHash)
        ->and($stringHash)->not->toBe($boolHash);
});

test('computePayloadHash matches hard-coded known test vector', function (): void {
    // Canonical JSON: {"app":"aihome","meta":{"author":"system","enabled":true},"steps":["intro","survey","result"],"version":1}
    $payload = [
        'version' => 1,
        'app' => 'aihome',
        'steps' => ['intro', 'survey', 'result'],
        'meta' => [
            'enabled' => true,
            'author' => 'system',
        ],
    ];

    $canonicalJson = '{"app":"aihome","meta":{"author":"system","enabled":true},"steps":["intro","survey","result"],"version":1}';
    $expectedHash = hash('sha256', $canonicalJson);

    $actualHash = ConfigVersion::computePayloadHash($payload);

    expect($actualHash)->toBe($expectedHash)
        ->and($actualHash)->toBe(hash('sha256', '{"app":"aihome","meta":{"author":"system","enabled":true},"steps":["intro","survey","result"],"version":1}'));
});

test('computePayloadHash produces different hashes for different Unicode normalizations (NFC vs NFD)', function (): void {
    // Note: Unicode normalization differences (NFC vs NFD) represent the same visual glyph
    // but have different raw UTF-8 byte sequences. Because hashing works on canonical UTF-8 bytes,
    // NFC and NFD strings produce different hashes.
    $nfcString = "\u{00E9}";           // é as single code point (2 bytes: C3 A9)
    $nfdString = "\u{0065}\u{0301}";   // e + combining acute accent (3 bytes: 65 CC 81)

    // Visual appearance is identical
    expect(bin2hex($nfcString))->toBe('c3a9')
        ->and(bin2hex($nfdString))->toBe('65cc81');

    $nfcHash = ConfigVersion::computePayloadHash(['text' => $nfcString]);
    $nfdHash = ConfigVersion::computePayloadHash(['text' => $nfdString]);

    expect($nfcHash)->not->toBe($nfdHash);
});

test('computePayloadHash throws JsonException when payload contains unencodable values', function (): void {
    expect(fn () => ConfigVersion::computePayloadHash(['invalid' => NAN]))
        ->toThrow(\JsonException::class);

    expect(fn () => ConfigVersion::computePayloadHash(['invalid' => INF]))
        ->toThrow(\JsonException::class);
});
