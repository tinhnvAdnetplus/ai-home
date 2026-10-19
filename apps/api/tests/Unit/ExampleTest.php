<?php

declare(strict_types=1);

test('pure unit test executes expected assertions', function () {
    $sum = 10 + 20;

    expect($sum)->toBe(30)
        ->and(mb_strtoupper('aihome'))->toBe('AIHOME');
});
