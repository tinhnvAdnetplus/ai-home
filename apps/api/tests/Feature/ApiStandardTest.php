<?php

declare(strict_types=1);

use App\Http\Resources\PaginatedCollection;
use App\Support\ApiErrorCode;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

beforeEach(function (): void {
    /** @var Tests\TestCase $this */
    $this->withoutVite();

    RateLimiter::for('test-api-limiter', function (Request $request): Limit {
        return Limit::perMinute(2)->by($request->ip());
    });

    Route::middleware('api')->prefix('api/test')->group(function (): void {
        Route::get('success', function () {
            return response()->json(['message' => 'ok']);
        });

        Route::post('validation', function (Request $request) {
            $request->validate([
                'user.name' => ['required', 'string', 'min:3'],
                'items.*.title' => ['required', 'string'],
            ], [
                'user.name.required' => 'ユーザー名は必須です。',
                'user.name.min' => 'ユーザー名は3文字以上で入力してください。',
                'items.*.title.required' => 'アイテムのタイトルは必須です。',
            ]);

            return response()->json(['status' => 'validated']);
        });

        Route::post('multiple-validation-errors', function () {
            $validator = Validator::make([], []);
            $validator->errors()->add('field_one', 'First error message.');
            $validator->errors()->add('field_one', 'Second error message.');

            throw new ValidationException($validator);
        });

        Route::get('unauthenticated', function () {
            throw new AuthenticationException('Unauthenticated.');
        });

        Route::get('forbidden', function () {
            throw new AuthorizationException('This action is unauthorized.');
        });

        Route::get('model-not-found', function () {
            throw new ModelNotFoundException('Resource not found.');
        });

        Route::get('payload-too-large', function () {
            throw new PostTooLargeException('Payload exceeds limit.');
        });

        Route::get('server-error', function () {
            throw new RuntimeException('Sensitive database password leaked in query: SELECT * FROM credentials');
        });

        Route::middleware('throttle:test-api-limiter')->get('throttled', function () {
            return response()->json(['status' => 'ok']);
        });

        Route::get('pagination', function (Request $request) {
            $total = (int) $request->query('total', 100);
            $items = $total > 0 ? range(1, $total) : [];
            $page = PaginatedCollection::page($request);
            $perPage = PaginatedCollection::perPage($request);

            $slice = array_slice($items, ($page - 1) * $perPage, $perPage);
            $paginator = new LengthAwarePaginator($slice, $total, $perPage, $page);

            return new PaginatedCollection($paginator);
        });
    });

    $webRoute = Route::get('web-test', function () {
        abort(404);
    });

    $routeCollection = Route::getRoutes();
    $reflection = new ReflectionProperty($routeCollection, 'routes');
    /** @var array<string, array<string, \Illuminate\Routing\Route>> $routes */
    $routes = $reflection->getValue($routeCollection);
    $key = $webRoute->getDomain().$webRoute->uri();
    foreach (['GET', 'HEAD'] as $method) {
        if (isset($routes[$method][$key])) {
            $target = $routes[$method][$key];
            unset($routes[$method][$key]);
            $routes[$method] = array_merge([$key => $target], $routes[$method]);
        }
    }
    $reflection->setValue($routeCollection, $routes);
});

test('every error under /api/* returns RFC 9457 application/problem+json with standard keys', function () {
    /** @var Tests\TestCase $this */
    $response = $this->get('/api/test/unauthenticated');

    $response->assertStatus(401);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['type'])->toBe('about:blank')
        ->and($body['title'])->toBe('Unauthenticated')
        ->and($body['status'])->toBe(401)
        ->and($body['detail'])->toBe('Unauthenticated.')
        ->and($body['code'])->toBe(ApiErrorCode::UNAUTHENTICATED->value)
        ->and($body['request_id'])->toBe($response->headers->get('X-Request-Id'))
        ->and($body)->not->toHaveKey('errors');
});

test('missing api route returns problem+json 404 even without Accept header', function () {
    /** @var Tests\TestCase $this */
    $response = $this->call('GET', '/api/v1/definitely-not-found-route-12345', [], [], [], [
        'HTTP_ACCEPT' => '*/*',
    ]);

    $response->assertStatus(404);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['type'])->toBe('about:blank')
        ->and($body['title'])->toBe('Not Found')
        ->and($body['status'])->toBe(404)
        ->and($body['code'])->toBe(ApiErrorCode::NOT_FOUND->value)
        ->and($body['request_id'])->toBe($response->headers->get('X-Request-Id'));
});

test('wrong method on api route returns 405 with Allow header and problem+json body', function () {
    /** @var Tests\TestCase $this */
    $response = $this->post('/api/v1/health');

    $response->assertStatus(405);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertHeader('Allow');
    $response->assertHeader('X-Request-Id');

    expect($response->headers->get('Allow'))->toContain('GET');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['status'])->toBe(405)
        ->and($body['code'])->toBe(ApiErrorCode::METHOD_NOT_ALLOWED->value)
        ->and($body['title'])->toBe('Method Not Allowed')
        ->and($body['request_id'])->toBe($response->headers->get('X-Request-Id'));
});

test('all required ApiErrorCode mappings produce valid problem+json responses', function (
    string $endpoint,
    string $method,
    int $expectedStatus,
    string $expectedCode
) {
    /** @var Tests\TestCase $this */
    $response = $this->call($method, $endpoint);

    $response->assertStatus($expectedStatus);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['status'])->toBe($expectedStatus)
        ->and($body['code'])->toBe($expectedCode)
        ->and($body['request_id'])->toBe($response->headers->get('X-Request-Id'));
})->with([
    '401 unauthenticated' => ['/api/test/unauthenticated', 'GET', 401, ApiErrorCode::UNAUTHENTICATED->value],
    '403 forbidden' => ['/api/test/forbidden', 'GET', 403, ApiErrorCode::FORBIDDEN->value],
    '404 model not found' => ['/api/test/model-not-found', 'GET', 404, ApiErrorCode::NOT_FOUND->value],
    '413 payload too large' => ['/api/test/payload-too-large', 'GET', 413, ApiErrorCode::PAYLOAD_TOO_LARGE->value],
]);

test('validation errors include nested/array keys and Japanese UTF-8 messages without corruption', function () {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/test/validation', [
        'user' => [
            'name' => 'あ',
        ],
        'items' => [
            ['title' => ''],
        ],
    ]);

    $response->assertStatus(422);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['code'])->toBe(ApiErrorCode::VALIDATION_FAILED->value)
        ->and($body['status'])->toBe(422)
        ->and($body['title'])->toBe('Validation Failed')
        ->and($body['request_id'])->toBe($response->headers->get('X-Request-Id'))
        ->and($body)->toHaveKey('errors');

    /** @var array<string, array<int, string>> $errors */
    $errors = $body['errors'];
    expect($errors)->toHaveKey('user.name')
        ->and($errors['user.name'][0])->toBe('ユーザー名は3文字以上で入力してください。')
        ->and($errors)->toHaveKey('items.0.title')
        ->and($errors['items.0.title'][0])->toBe('アイテムのタイトルは必須です。');
});

test('validation supports multiple errors per field', function () {
    /** @var Tests\TestCase $this */
    $response = $this->postJson('/api/test/multiple-validation-errors');

    $response->assertStatus(422);
    $response->assertHeader('Content-Type', 'application/problem+json');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['code'])->toBe(ApiErrorCode::VALIDATION_FAILED->value);

    /** @var array<string, array<int, string>> $errors */
    $errors = $body['errors'];
    expect($errors['field_one'])->toBeArray()
        ->and(count($errors['field_one']))->toBe(2)
        ->and($errors['field_one'][0])->toBe('First error message.')
        ->and($errors['field_one'][1])->toBe('Second error message.');
});

test('server error 500 does not leak details when APP_DEBUG is false', function () {
    /** @var Tests\TestCase $this */
    config(['app.debug' => false]);

    $response = $this->get('/api/test/server-error');

    $response->assertStatus(500);
    $response->assertHeader('Content-Type', 'application/problem+json');
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['status'])->toBe(500)
        ->and($body['code'])->toBe(ApiErrorCode::SERVER_ERROR->value)
        ->and($body['title'])->toBe('Internal Server Error')
        ->and($body['detail'])->toBe('An unexpected error occurred.')
        ->and($body['request_id'])->toBe($response->headers->get('X-Request-Id'))
        ->and($body)->not->toHaveKey('debug')
        ->and($body)->not->toHaveKey('exception')
        ->and($body)->not->toHaveKey('trace')
        ->and($body)->not->toHaveKey('file')
        ->and($body)->not->toHaveKey('line');

    $content = $response->getContent() ?: '';
    expect($content)->not->toContain('Sensitive database password')
        ->and($content)->not->toContain('credentials')
        ->and($content)->not->toContain('RuntimeException');
});

test('server error 500 includes debug object when APP_DEBUG is true', function () {
    /** @var Tests\TestCase $this */
    config(['app.debug' => true]);

    $response = $this->get('/api/test/server-error');

    $response->assertStatus(500);
    $response->assertHeader('Content-Type', 'application/problem+json');

    /** @var array<string, mixed> $body */
    $body = $response->json();
    expect($body['status'])->toBe(500)
        ->and($body['code'])->toBe(ApiErrorCode::SERVER_ERROR->value)
        ->and($body)->toHaveKey('debug');

    /** @var array<string, mixed> $debug */
    $debug = $body['debug'];
    expect($debug['exception'])->toBe('RuntimeException')
        ->and($debug['message'])->toContain('Sensitive database password')
        ->and($debug)->toHaveKey('file')
        ->and($debug)->toHaveKey('line')
        ->and($debug)->toHaveKey('trace');
});

test('request id echoes valid incoming header', function () {
    /** @var Tests\TestCase $this */
    $validId = 'client-req-12345678_v1.0';

    $response = $this->withHeader('X-Request-Id', $validId)->get('/api/test/success');

    $response->assertStatus(200);
    $response->assertHeader('X-Request-Id', $validId);
});

test('request id replaces invalid header with generated uuid', function (string $invalidId) {
    /** @var Tests\TestCase $this */
    $response = $this->withHeader('X-Request-Id', $invalidId)->get('/api/test/success');

    $response->assertStatus(200);
    $actualId = (string) $response->headers->get('X-Request-Id');

    expect($actualId)->not->toBe($invalidId)
        ->and(preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $actualId))->toBe(1);
})->with([
    'too short (5 chars)' => ['short'],
    'too long (>64 chars)' => ['this-request-id-is-far-too-long-and-exceeds-the-maximum-allowed-length-of-64-characters'],
    'contains spaces' => ['has space in id'],
    'contains script tag' => ['<script>alert(1)</script>'],
    'special symbols' => ['req$id#bad!'],
]);

test('rate limiter throttles requests after limit and leaves different IP unaffected', function () {
    /** @var Tests\TestCase $this */
    RateLimiter::clear('test-api-limiter:192.168.1.50');
    RateLimiter::clear('test-api-limiter:192.168.1.60');

    // 1st request from IP A -> 200
    $res1 = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.50'])->get('/api/test/throttled');
    $res1->assertStatus(200);

    // 2nd request from IP A -> 200
    $res2 = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.50'])->get('/api/test/throttled');
    $res2->assertStatus(200);

    // 3rd request from IP A -> 429
    $res3 = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.50'])->get('/api/test/throttled');
    $res3->assertStatus(429);
    $res3->assertHeader('Content-Type', 'application/problem+json');
    $res3->assertHeader('Retry-After');
    $res3->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $body */
    $body = $res3->json();
    expect($body['status'])->toBe(429)
        ->and($body['code'])->toBe(ApiErrorCode::TOO_MANY_REQUESTS->value)
        ->and($body['title'])->toBe('Too Many Requests')
        ->and($body['request_id'])->toBe($res3->headers->get('X-Request-Id'));

    // Request from different IP B -> 200 (unaffected)
    $resDifferentIp = $this->withServerVariables(['REMOTE_ADDR' => '192.168.1.60'])->get('/api/test/throttled');
    $resDifferentIp->assertStatus(200);
});

test('pagination clamps per_page to 100 when exceeding 100', function () {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/test/pagination?per_page=1000&total=150');

    $response->assertStatus(200);
    /** @var array<string, mixed> $data */
    $data = $response->json();

    expect($data['meta']['per_page'])->toBe(100)
        ->and(count($data['data']))->toBe(100);
});

test('pagination safely clamps or falls back for boundary per_page and page inputs', function (
    string $query,
    int $expectedPage,
    int $expectedPerPage
) {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/test/pagination?'.$query);

    $response->assertStatus(200);
    /** @var array<string, mixed> $data */
    $data = $response->json();

    expect($data['meta']['page'])->toBe($expectedPage)
        ->and($data['meta']['per_page'])->toBe($expectedPerPage);
})->with([
    'per_page=1000 clamps to 100' => ['per_page=1000', 1, 100],
    'per_page=1e9 clamps to 100' => ['per_page=1e9', 1, 100],
    'per_page=0 clamps to 1' => ['per_page=0', 1, 1],
    'per_page=-5 clamps to 1' => ['per_page=-5', 1, 1],
    'per_page=abc falls back to default 20' => ['per_page=abc', 1, 20],
    'page=0 falls back to 1' => ['page=0', 1, 20],
    'page=abc falls back to 1' => ['page=abc', 1, 20],
    'page=-10 falls back to 1' => ['page=-10', 1, 20],
]);

test('pagination returns empty data array when page is beyond total', function () {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/test/pagination?total=10&per_page=20&page=5');

    $response->assertStatus(200);
    /** @var array<string, mixed> $data */
    $data = $response->json();

    expect($data['data'])->toBeArray()
        ->and($data['data'])->toBeEmpty()
        ->and($data['meta']['total'])->toBe(10)
        ->and($data['meta']['last_page'])->toBe(1)
        ->and($data['meta']['page'])->toBe(5)
        ->and($data['meta']['per_page'])->toBe(20);
});

test('pagination total and last_page are correct for 0, 1, 20, 21, and 100 items', function (
    int $total,
    int $expectedLastPage
) {
    /** @var Tests\TestCase $this */
    $response = $this->getJson('/api/test/pagination?per_page=20&total='.$total);

    $response->assertStatus(200);
    /** @var array<string, mixed> $data */
    $data = $response->json();

    expect($data['meta']['total'])->toBe($total)
        ->and($data['meta']['last_page'])->toBe($expectedLastPage);
})->with([
    '0 items -> last_page 1' => [0, 1],
    '1 item -> last_page 1' => [1, 1],
    '20 items -> last_page 1' => [20, 1],
    '21 items -> last_page 2' => [21, 2],
    '100 items -> last_page 5' => [100, 5],
]);

test('non-api route returns normal HTML error page instead of problem+json', function () {
    /** @var Tests\TestCase $this */
    $response = $this->get('/web-test');

    $response->assertStatus(404);
    $contentType = (string) $response->headers->get('Content-Type');
    expect($contentType)->not->toContain('application/problem+json')
        ->and($contentType)->toContain('text/html');
});

test('health endpoint remains unchanged in shape with status ok and request id header', function () {
    /** @var Tests\TestCase $this */
    $response = $this->get('/api/v1/health');

    $response->assertStatus(200);
    $response->assertHeader('X-Request-Id');

    /** @var array<string, mixed> $data */
    $data = $response->json();
    expect(array_keys($data))->toEqualCanonicalizing(['status', 'db', 'time'])
        ->and($data['status'])->toBe('ok')
        ->and($data['db'])->toBe('up')
        ->and($data['time'])->toBeString();
});
