<?php

declare(strict_types=1);

namespace App\Support;

use App\Exceptions\ConfigProblemException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

final class ApiProblem
{
    public const MEDIA_TYPE = 'application/problem+json';

    public static function toResponse(Throwable $e, Request $request): JsonResponse
    {
        $requestId = RequestId::resolve($request);
        $isDebug = (bool) config('app.debug', false);

        [$code, $status, $title, $detail, $errors, $headers] = self::mapException($e, $isDebug);

        /** @var array<string, mixed> $payload */
        $payload = [
            'type' => 'about:blank',
            'title' => $title,
            'status' => $status,
            'detail' => $detail,
            'code' => $code->value,
            'request_id' => $requestId,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        if ($e instanceof ConfigProblemException && $e->issues !== null) {
            $payload['issues'] = $e->issues;
        }

        if ($status >= 500 && $isDebug) {
            $payload['debug'] = [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ];
        }

        $headers['Content-Type'] = self::MEDIA_TYPE;
        $headers[RequestId::HEADER] = $requestId;

        return new JsonResponse($payload, $status, $headers, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * @return array{0: ApiErrorCode, 1: int, 2: string, 3: string, 4: array<string, array<int, string>>|null, 5: array<string, string>}
     */
    private static function mapException(Throwable $e, bool $isDebug): array
    {
        /** @var array<string, string> $headers */
        $headers = [];
        $errors = null;

        if ($e instanceof ConfigProblemException) {
            $code = $e->errorCode;
            $status = $e->getStatusCode();
            $title = $code->defaultTitle();
            $detail = $e->getMessage() !== '' ? $e->getMessage() : $code->defaultDetail();
            $rawHeaders = $e->getHeaders();
            foreach ($rawHeaders as $key => $value) {
                if (is_string($value)) {
                    $headers[$key] = $value;
                }
            }

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof ValidationException) {
            $code = ApiErrorCode::VALIDATION_FAILED;
            $status = 422;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();
            /** @var array<string, array<int, string>> $errors */
            $errors = $e->errors();

            return [$code, $status, $title, $detail, $errors, $headers];
        }

        if ($e instanceof AuthenticationException) {
            $code = ApiErrorCode::UNAUTHENTICATED;
            $status = 401;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
            $code = ApiErrorCode::FORBIDDEN;
            $status = 403;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            $code = ApiErrorCode::NOT_FOUND;
            $status = 404;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            $code = ApiErrorCode::METHOD_NOT_ALLOWED;
            $status = 405;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();
            $rawHeaders = $e->getHeaders();
            foreach ($rawHeaders as $key => $value) {
                if (is_string($value)) {
                    $headers[$key] = $value;
                }
            }
            if (!isset($headers['Allow']) || $headers['Allow'] === '') {
                $headers['Allow'] = 'GET, HEAD';
            }

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof ThrottleRequestsException || $e instanceof TooManyRequestsHttpException) {
            $code = ApiErrorCode::TOO_MANY_REQUESTS;
            $status = 429;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();
            $rawHeaders = $e->getHeaders();
            foreach ($rawHeaders as $key => $value) {
                if (is_string($value)) {
                    $headers[$key] = $value;
                }
            }
            if (!isset($headers['Retry-After'])) {
                $headers['Retry-After'] = '60';
            }

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof PostTooLargeException) {
            $code = ApiErrorCode::PAYLOAD_TOO_LARGE;
            $status = 413;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof TokenMismatchException) {
            $code = ApiErrorCode::CSRF_MISMATCH;
            $status = 419;
            $title = $code->defaultTitle();
            $detail = $code->defaultDetail();

            return [$code, $status, $title, $detail, null, $headers];
        }

        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();
            $rawHeaders = $e->getHeaders();
            foreach ($rawHeaders as $key => $value) {
                if (is_string($value)) {
                    $headers[$key] = $value;
                }
            }

            $code = self::codeForStatus($status);
            $title = $code->defaultTitle();

            if ($status >= 500) {
                $detail = $isDebug && $e->getMessage() !== '' ? $e->getMessage() : $code->defaultDetail();
            } else {
                $detail = $e->getMessage() !== '' ? $e->getMessage() : $code->defaultDetail();
            }

            return [$code, $status, $title, $detail, null, $headers];
        }

        $code = ApiErrorCode::SERVER_ERROR;
        $status = 500;
        $title = $code->defaultTitle();
        $detail = $isDebug && $e->getMessage() !== '' ? $e->getMessage() : $code->defaultDetail();

        return [$code, $status, $title, $detail, null, $headers];
    }

    private static function codeForStatus(int $status): ApiErrorCode
    {
        return match ($status) {
            401 => ApiErrorCode::UNAUTHENTICATED,
            403 => ApiErrorCode::FORBIDDEN,
            404 => ApiErrorCode::NOT_FOUND,
            405 => ApiErrorCode::METHOD_NOT_ALLOWED,
            413 => ApiErrorCode::PAYLOAD_TOO_LARGE,
            419 => ApiErrorCode::CSRF_MISMATCH,
            422 => ApiErrorCode::VALIDATION_FAILED,
            429 => ApiErrorCode::TOO_MANY_REQUESTS,
            default => $status < 500 ? ApiErrorCode::CLIENT_ERROR : ApiErrorCode::SERVER_ERROR,
        };
    }
}
