<?php

declare(strict_types=1);

namespace App\Support;

enum ApiErrorCode: string
{
    case VALIDATION_FAILED = 'VALIDATION_FAILED';
    case UNAUTHENTICATED = 'UNAUTHENTICATED';
    case FORBIDDEN = 'FORBIDDEN';
    case NOT_FOUND = 'NOT_FOUND';
    case METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED';
    case TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';
    case PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE';
    case CSRF_MISMATCH = 'CSRF_MISMATCH';
    case CONFIG_INVALID = 'CONFIG_INVALID';
    case PRECONDITION_REQUIRED = 'PRECONDITION_REQUIRED';
    case PRECONDITION_FAILED = 'PRECONDITION_FAILED';
    case CONFLICT = 'CONFLICT';
    case NO_DRAFT = 'NO_DRAFT';
    case CLIENT_ERROR = 'CLIENT_ERROR';
    case SERVER_ERROR = 'SERVER_ERROR';

    public function defaultHttpStatus(): int
    {
        return match ($this) {
            self::VALIDATION_FAILED, self::CONFIG_INVALID, self::NO_DRAFT => 422,
            self::UNAUTHENTICATED => 401,
            self::FORBIDDEN => 403,
            self::NOT_FOUND => 404,
            self::METHOD_NOT_ALLOWED => 405,
            self::CONFLICT => 409,
            self::PRECONDITION_FAILED => 412,
            self::PAYLOAD_TOO_LARGE => 413,
            self::CSRF_MISMATCH => 419,
            self::PRECONDITION_REQUIRED => 428,
            self::TOO_MANY_REQUESTS => 429,
            self::CLIENT_ERROR => 400,
            self::SERVER_ERROR => 500,
        };
    }

    public function defaultTitle(): string
    {
        return match ($this) {
            self::VALIDATION_FAILED => 'Validation Failed',
            self::UNAUTHENTICATED => 'Unauthenticated',
            self::FORBIDDEN => 'Forbidden',
            self::NOT_FOUND => 'Not Found',
            self::METHOD_NOT_ALLOWED => 'Method Not Allowed',
            self::CONFLICT => 'Conflict',
            self::PRECONDITION_FAILED => 'Precondition Failed',
            self::PAYLOAD_TOO_LARGE => 'Payload Too Large',
            self::CSRF_MISMATCH => 'CSRF Token Mismatch',
            self::CONFIG_INVALID => 'Config Invalid',
            self::PRECONDITION_REQUIRED => 'Precondition Required',
            self::NO_DRAFT => 'No Draft',
            self::TOO_MANY_REQUESTS => 'Too Many Requests',
            self::CLIENT_ERROR => 'Client Error',
            self::SERVER_ERROR => 'Internal Server Error',
        };
    }

    public function defaultDetail(): string
    {
        return match ($this) {
            self::VALIDATION_FAILED => 'The given data was invalid.',
            self::UNAUTHENTICATED => 'Unauthenticated.',
            self::FORBIDDEN => 'This action is unauthorized.',
            self::NOT_FOUND => 'The requested resource was not found.',
            self::METHOD_NOT_ALLOWED => 'The HTTP method is not allowed for this route.',
            self::CONFLICT => 'A conflict occurred with the current state of the resource.',
            self::PRECONDITION_FAILED => 'The resource has been modified. Precondition failed.',
            self::PAYLOAD_TOO_LARGE => 'The request payload is too large.',
            self::CSRF_MISMATCH => 'CSRF token mismatch. Please refresh and try again.',
            self::CONFIG_INVALID => 'The configuration payload is invalid.',
            self::PRECONDITION_REQUIRED => 'This request requires an If-Match header.',
            self::NO_DRAFT => 'No active draft exists for this configuration document.',
            self::TOO_MANY_REQUESTS => 'Too many requests. Please try again later.',
            self::CLIENT_ERROR => 'The request could not be processed.',
            self::SERVER_ERROR => 'An unexpected error occurred.',
        };
    }
}
