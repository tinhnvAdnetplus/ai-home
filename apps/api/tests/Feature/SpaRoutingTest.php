<?php

declare(strict_types=1);

test('spa catch-all returns app view for root and client routes', function (string $path) {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    $response = $this->get($path);

    $response->assertStatus(200);
    $response->assertViewIs('app');
})->with([
    'root path' => '/',
    'admin path' => '/admin/config',
    'deep path' => '/a/b/c',
    'wizard step' => '/wizard/step-2',
    'japanese path' => '/プラン',
    'trailing slash path' => '/admin/config/',
]);

test('spa catch-all does not swallow api routes and returns 404', function (string $path) {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    $response = $this->get($path);
    $response->assertStatus(404);

    $jsonResponse = $this->getJson($path);
    $jsonResponse->assertStatus(404);
    $jsonResponse->assertHeader('content-type', 'application/problem+json');
})->with([
    'api without slash' => '/api',
    'api with slash' => '/api/',
    'nonexistent api route' => '/api/v1/nope',
]);

test('boundary paths starting with api are served by the spa', function (string $path) {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    $response = $this->get($path);

    $response->assertStatus(200);
    $response->assertViewIs('app');
})->with([
    'apiary' => '/apiary',
    'api-docs' => '/api-docs',
]);

test('a post to root path returns 405 method not allowed', function () {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    $response = $this->post('/');

    $response->assertStatus(405);
});
