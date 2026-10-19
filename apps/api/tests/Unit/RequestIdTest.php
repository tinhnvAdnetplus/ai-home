<?php

declare(strict_types=1);

use App\Support\RequestId;

test('accepts well formed request ids', function (string $id): void {
    expect(RequestId::isValid($id))->toBeTrue();
})->with([
    'abcdefgh',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    str_repeat('A', 64),
    'req_2026.10.12-xyz',
]);

test('rejects malformed request ids, including a trailing newline that a plain $ anchor would let through', function (mixed $id): void {
    expect(RequestId::isValid($id))->toBeFalse();
})->with([
    'too-short' => ['abc1234'],
    'too-long' => [str_repeat('a', 65)],
    'space' => ['abcd efgh'],
    'script tag' => ['<script>alert(1)</script>'],
    'trailing newline' => ["abcdefgh\n"],
    'embedded newline' => ["abcd\nefgh"],
    'unicode' => ['リクエスト12345'],
    'empty' => [''],
    'null' => [null],
    'array' => [['abcdefgh']],
    'int' => [12345678],
]);
