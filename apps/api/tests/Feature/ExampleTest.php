<?php

declare(strict_types=1);

test('home route serves the spa application shell', function () {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertViewIs('app');
});
