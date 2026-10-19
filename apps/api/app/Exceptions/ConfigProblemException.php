<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Config\Wizard\ConfigIssue;
use App\Support\ApiErrorCode;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

final class ConfigProblemException extends HttpException
{
    /**
     * @param list<array{code: string, path: string, message: string}>|null $issues
     * @param array<string, string> $headers
     */
    public function __construct(
        int $statusCode,
        public readonly ApiErrorCode $errorCode,
        ?string $message = null,
        public readonly ?array $issues = null,
        ?Throwable $previous = null,
        array $headers = [],
        int $code = 0
    ) {
        parent::__construct(
            $statusCode,
            $message ?? $errorCode->defaultDetail(),
            $previous,
            $headers,
            $code
        );
    }

    /**
     * @param list<ConfigIssue|array<string, mixed>> $issues
     */
    public static function configInvalid(array $issues, ?string $message = null): self
    {
        $formatted = [];
        foreach ($issues as $issue) {
            if ($issue instanceof ConfigIssue) {
                $formatted[] = [
                    'code' => $issue->code->value,
                    'path' => $issue->getPathString(),
                    'message' => $issue->message,
                ];
            } else {
                $formatted[] = [
                    'code' => (string) ($issue['code'] ?? 'UNKNOWN'),
                    'path' => is_array($issue['path'] ?? null) ? implode('.', $issue['path']) : (string) ($issue['path'] ?? '.'),
                    'message' => (string) ($issue['message'] ?? ''),
                ];
            }
        }

        return new self(
            statusCode: 422,
            errorCode: ApiErrorCode::CONFIG_INVALID,
            message: $message ?? ApiErrorCode::CONFIG_INVALID->defaultDetail(),
            issues: $formatted
        );
    }

    public static function preconditionRequired(?string $message = null): self
    {
        return new self(
            statusCode: 428,
            errorCode: ApiErrorCode::PRECONDITION_REQUIRED,
            message: $message ?? ApiErrorCode::PRECONDITION_REQUIRED->defaultDetail()
        );
    }

    public static function preconditionFailed(?string $message = null): self
    {
        return new self(
            statusCode: 412,
            errorCode: ApiErrorCode::PRECONDITION_FAILED,
            message: $message ?? ApiErrorCode::PRECONDITION_FAILED->defaultDetail()
        );
    }

    public static function conflict(?string $message = null): self
    {
        return new self(
            statusCode: 409,
            errorCode: ApiErrorCode::CONFLICT,
            message: $message ?? ApiErrorCode::CONFLICT->defaultDetail()
        );
    }

    public static function noDraft(?string $message = null): self
    {
        return new self(
            statusCode: 422,
            errorCode: ApiErrorCode::NO_DRAFT,
            message: $message ?? ApiErrorCode::NO_DRAFT->defaultDetail()
        );
    }
}
